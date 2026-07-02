import { verifyClerkUser } from "@/app/api/stream/audio-session+api";

const defaultVisionAgentUrl = "http://127.0.0.1:8799";

type StopAgentRequest = {
  callId?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    if (!(await verifyClerkUser(request))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as StopAgentRequest;
    if (!body.callId || !body.sessionId) {
      return Response.json(
        { error: "Missing Vision Agent session details." },
        { status: 400 },
      );
    }

    const response = await fetchVisionAgent(
      `/calls/${encodeURIComponent(body.callId)}/sessions/${encodeURIComponent(
        body.sessionId,
      )}`,
      { method: "DELETE" },
    );

    if (!response.ok && response.status !== 404) {
      const data = await response.json().catch(() => null);
      return Response.json(
        { error: getVisionAgentError(data, "Vision Agent session stop failed.") },
        { status: response.status },
      );
    }

    return Response.json({ stopped: true });
  } catch (error) {
    console.error("Vision Agent session stop proxy error:", error);
    return Response.json(
      { error: "Unable to stop the Vision Agent session." },
      { status: 500 },
    );
  }
}

async function fetchVisionAgent(path: string, init: RequestInit) {
  const visionAgentUrl =
    process.env.VISION_AGENT_URL?.replace(/\/$/g, "") ?? defaultVisionAgentUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(`${visionAgentUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function getVisionAgentError(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return fallback;
}
