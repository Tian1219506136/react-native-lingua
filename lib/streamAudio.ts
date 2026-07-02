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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Stream audio session request failed.",
    );
  }

  return data as StreamAudioSession;
}

function getStreamAudioSessionUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/g, "")}/api/stream/audio-session`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    return `http://${hostUri}/api/stream/audio-session`;
  }

  return "/api/stream/audio-session";
}
