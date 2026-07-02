import { verifyClerkUser } from "@/app/api/stream/audio-session+api";

const defaultVisionAgentUrl = "http://127.0.0.1:8799";

type StartAgentRequest = {
  callId?: string;
  callType?: string;
};

export async function POST(request: Request) {
  try {
    if (!(await verifyClerkUser(request))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as StartAgentRequest;
    if (!body.callId || !body.callType) {
      return Response.json(
        { error: "Missing Stream call details." },
        { status: 400 },
      );
    }

    const response = await fetchVisionAgent(
      `/calls/${encodeURIComponent(body.callId)}/sessions`,
      {
        body: JSON.stringify({ call_type: body.callType }),
        method: "POST",
      },
    );

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return Response.json(
        { error: getVisionAgentError(data, "Vision Agent session start failed.") },
        { status: response.status },
      );
    }

    return Response.json({
      callId: data.call_id ?? body.callId,
      sessionId: data.session_id,
      startedAt: data.session_started_at,
    });
  } catch (error) {
    console.error("Vision Agent session start proxy error:", error);
    return Response.json(
      { error: "Unable to start the Vision Agent session." },
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
