import { verifyToken } from "@clerk/backend";

import { getLanguageByCode } from "@/data/languages";
import { getLessonById } from "@/data/lessons";
import type { LanguageCode } from "@/types/learning";

type AudioSessionRequest =
  | {
      intent: "token";
      userImage?: string | null;
      userName?: string | null;
    }
  | {
      intent: "call";
      languageCode: string;
      lessonId: string;
      userImage?: string | null;
      userName?: string | null;
    };

type VerifiedClerkUser = {
  id: string;
};

const callType = "default";
const streamBaseUrl = "https://video.stream-io-api.com/video";

export async function POST(request: Request) {
  try {
    const streamApiKey = process.env.STREAM_API_KEY;
    const streamApiSecret = process.env.STREAM_API_SECRET;

    if (!streamApiKey || !streamApiSecret) {
      return Response.json(
        { error: "Stream server credentials are not configured." },
        { status: 500 },
      );
    }

    const user = await verifyClerkUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as AudioSessionRequest;
    const token = await createStreamUserToken({
      secret: streamApiSecret,
      userId: user.id,
    });

    if (body.intent === "token") {
      return Response.json({
        apiKey: streamApiKey,
        token,
        userId: user.id,
        userImage: body.userImage ?? undefined,
        userName: body.userName ?? user.id,
      });
    }

    const lesson = getLessonById(body.lessonId);
    const language = isLanguageCode(body.languageCode)
      ? getLanguageByCode(body.languageCode)
      : null;

    if (!lesson || !language || lesson.languageCode !== language.code) {
      return Response.json(
        { error: "The selected lesson or language is invalid." },
        { status: 400 },
      );
    }

    const callId = createLessonCallId({
      languageCode: language.code,
      lessonId: lesson.id,
      userId: user.id,
    });

    await createAudioOnlyCall({
      apiKey: streamApiKey,
      callId,
      token,
      userId: user.id,
      userImage: body.userImage,
      userName: body.userName,
      metadata: {
        languageCode: language.code,
        languageName: language.name,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        unitId: lesson.unitId,
      },
    });

    return Response.json({
      apiKey: streamApiKey,
      callId,
      callType,
      token,
      userId: user.id,
      userImage: body.userImage ?? undefined,
      userName: body.userName ?? user.id,
    });
  } catch (error) {
    console.error("Stream audio session error:", error);
    return Response.json(
      { error: "Unable to prepare the Stream audio session." },
      { status: 500 },
    );
  }
}

async function verifyClerkUser(
  request: Request,
): Promise<VerifiedClerkUser | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!token || !secretKey) {
    return null;
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    return claims.sub ? { id: claims.sub } : null;
  } catch (error) {
    console.error("Clerk token verification failed:", error);
    return null;
  }
}

async function createAudioOnlyCall({
  apiKey,
  callId,
  metadata,
  token,
  userId,
  userImage,
  userName,
}: {
  apiKey: string;
  callId: string;
  metadata: Record<string, string>;
  token: string;
  userId: string;
  userImage?: string | null;
  userName?: string | null;
}) {
  const requestUrl = new URL(`${streamBaseUrl}/call/${callType}/${callId}`);
  requestUrl.searchParams.set("api_key", apiKey);
  requestUrl.searchParams.set("user_id", userId);

  const response = await fetch(requestUrl.toString(), {
    body: JSON.stringify({
      data: {
        created_by_id: userId,
        custom: {
          mode: "lesson-audio",
          ...metadata,
        },
        members: [
          {
            user_id: userId,
            custom: {
              image: userImage ?? undefined,
              name: userName ?? userId,
            },
          },
        ],
        settings_override: {
          audio: { mic_default_on: true },
          video: { camera_default_on: false },
        },
      },
    }),
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "stream-auth-type": "jwt",
      "X-Stream-Client": "lingua-expo-api-route",
    },
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Stream call creation failed: ${response.status} ${detail}`);
  }
}

async function createStreamUserToken({
  secret,
  userId,
}: {
  secret: string;
  userId: string;
}) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 4;

  return signJwt(
    { alg: "HS256", typ: "JWT" },
    { exp: expiresAt, iat: issuedAt, user_id: userId },
    secret,
  );
}

async function signJwt(
  header: Record<string, string>,
  payload: Record<string, number | string>,
  secret: string,
) {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function base64UrlEncode(value: ArrayBuffer | string) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createLessonCallId({
  languageCode,
  lessonId,
  userId,
}: {
  languageCode: string;
  lessonId: string;
  userId: string;
}) {
  return `lesson-${languageCode}-${lessonId}-${userId}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 128);
}

function isLanguageCode(value: string): value is LanguageCode {
  return ["de", "es", "fr", "ja", "ko", "zh"].includes(value);
}
