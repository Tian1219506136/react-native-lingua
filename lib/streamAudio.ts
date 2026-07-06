import Constants from "expo-constants";

type StreamAudioTokenRequest = {
  intent: "token";
  userImage?: string | null;
  userName?: string | null;
};

type StreamAudioCallRequest = {
  intent: "call";
  languageCode: string;
  lessonId: string;
  userImage?: string | null;
  userName?: string | null;
};

export type StreamAudioSession = {
  apiKey: string;
  callId?: string;
  callType?: string;
  token: string;
  userId: string;
  userImage?: string;
  userName: string;
};

export type StreamAgentSession = {
  callId: string;
  sessionId: string;
  startedAt?: string;
};

export async function fetchStreamAudioSession({
  clerkToken,
  payload,
}: {
  clerkToken: string;
  payload: StreamAudioCallRequest | StreamAudioTokenRequest;
}) {
  const response = await fetch(getStreamAudioSessionUrl(), {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${clerkToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Stream audio session request failed.",
    );
  }

  return (await response.json()) as StreamAudioSession;
}

export async function startStreamAgentSession({
  callId,
  callType,
  clerkToken,
}: {
  callId: string;
  callType: string;
  clerkToken: string;
}) {
  const response = await fetch(getStreamAgentSessionUrl("start"), {
    body: JSON.stringify({ callId, callType }),
    headers: {
      Authorization: `Bearer ${clerkToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Vision Agent session start failed.",
    );
  }

  return (await response.json()) as StreamAgentSession;
}

export async function stopStreamAgentSession({
  callId,
  clerkToken,
  sessionId,
}: {
  callId: string;
  clerkToken: string;
  sessionId: string;
}) {
  const response = await fetch(getStreamAgentSessionUrl("stop"), {
    body: JSON.stringify({ callId, sessionId }),
    headers: {
      Authorization: `Bearer ${clerkToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Vision Agent session stop failed.",
    );
  }
}

function getStreamAudioSessionUrl() {
  return getApiRouteUrl("/api/stream/audio-session");
}

function getStreamAgentSessionUrl(action: "start" | "stop") {
  return getApiRouteUrl(`/api/stream/agent-session/${action}`);
}

function getApiRouteUrl(path: string) {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/g, "")}${path}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    return `http://${hostUri}${path}`;
  }

  return path;
}
