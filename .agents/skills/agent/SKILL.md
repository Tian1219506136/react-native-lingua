---
name: Agent
description: Use when building real-time voice and video AI agents, deploying conversational interfaces with custom LLM pipelines, integrating phone calls or video processing, or connecting agents to knowledge bases and external tools. Agents handle call lifecycle, audio/video routing, turn-taking, and deployment automatically.
metadata:
    mintlify-proj: agent
    version: "1.0"
---

# Vision Agents Skill

## Product Summary

Vision Agents is an open-source Python framework for building real-time voice and video AI agents. Agents join sessions, connect to AI providers through swappable plugins (LLM, STT, TTS, vision models), and respond in real time. The framework handles call lifecycle, audio/video routing, turn-taking, and deployment. You configure an `Agent` class with provider plugins, define `create_agent()` and `join_call()` functions, and run via `Runner` for console or HTTP server modes.

**Key files and commands:**
- `agent.py` — Main agent configuration file (created by `uvx vision-agents init`)
- `pyproject.toml` — Dependencies and project metadata
- `.env` — API keys for providers (Stream, LLM, STT, TTS)
- `uv run agent.py run` — Console mode (single agent, browser demo)
- `uv run agent.py serve` — HTTP server mode (production, multiple agents)
- Primary docs: https://visionagents.ai

## When to Use

Reach for this skill when:
- **Building voice agents** — STT/LLM/TTS pipelines or realtime speech models (OpenAI, Gemini, Qwen)
- **Adding phone integration** — Inbound/outbound calls via Twilio or Telnyx
- **Video processing** — Real-time YOLO detection, VLM analysis, or avatar output
- **Deploying to production** — Docker, Kubernetes, horizontal scaling with Redis
- **Connecting tools** — Function calling, MCP servers, RAG with Gemini FileSearch or TurboPuffer
- **Testing agents** — Pytest-based testing without audio/video infrastructure
- **Monitoring** — OpenTelemetry metrics, Prometheus scraping, Jaeger tracing

Do not use for: authentication/account setup, pricing decisions, dashboard-only operations.

## Quick Reference

### Agent Constructor Parameters

| Parameter | Type | Required | Purpose |
|-----------|------|----------|---------|
| `edge` | EdgeTransport | Yes | Transport layer (Stream, Local, Tencent) |
| `llm` | LLM \| AudioLLM \| Realtime | Yes | Language model (text, audio, or realtime) |
| `agent_user` | User | Yes | Agent identity (name, id) |
| `instructions` | str | No | System prompt (default: "Keep replies short") |
| `stt` | STT | No | Speech-to-text (disabled in realtime mode) |
| `tts` | TTS | No | Text-to-speech (disabled in realtime mode) |
| `turn_detection` | TurnDetector | No | Interruption handling (auto-disabled if STT has built-in) |
| `processors` | List[Processor] | No | Video/audio processors (YOLO, VLM, etc.) |
| `avatar` | Avatar | No | Lip-synced visual character |
| `mcp_servers` | List[MCPServer] | No | External tool servers |

### CLI Commands

```bash
# Scaffold new project
uvx vision-agents init my-agent

# Console mode (single agent, browser demo)
uv run agent.py run [--call-id ID] [--video-track-override PATH]

# HTTP server (production)
uv run agent.py serve [--host 0.0.0.0] [--port 8000]

# Add plugins
uv add "vision-agents[deepgram,elevenlabs,gemini]"
```

### HTTP Server Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/calls/{call_id}/sessions` | Spawn agent for call |
| DELETE | `/calls/{call_id}/sessions/{session_id}` | Close agent session |
| GET | `/calls/{call_id}/sessions/{session_id}` | Get session info |
| GET | `/calls/{call_id}/sessions/{session_id}/metrics` | Real-time metrics |
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check |

### Core Methods

```python
# Lifecycle
call = await agent.create_call(call_type, call_id)
async with agent.join(call):
    await agent.simple_response("Say hi")
    await agent.finish()

# Responses
await agent.simple_response(text, interrupt=True)  # LLM → TTS
await agent.say(text, interrupt=False)  # Direct TTS (no LLM)

# Monitoring
agent.idle_for()  # Seconds alone on call
agent.on_call_for()  # Seconds since join
agent.metrics  # AgentMetrics object
```

### Plugin Categories

| Category | Examples | Use When |
|----------|----------|----------|
| **Realtime LLM** | OpenAI, Gemini, Qwen, xAI | Lowest latency, built-in interruption |
| **Text LLM** | Gemini, OpenAI, Anthropic, OpenRouter | Full control over STT/TTS, function calling |
| **STT** | Deepgram, ElevenLabs, Cartesia, Fish | Transcription (some have built-in turn detection) |
| **TTS** | ElevenLabs, Cartesia, Deepgram, Kokoro | Voice synthesis |
| **Vision** | Moondream, YOLO, Roboflow, NVIDIA | Video analysis, object detection |
| **Avatars** | Anam, LiveAvatar, LemonSlice | Lip-synced visual output |
| **Turn Detection** | Smart Turn, Vogent | Interruption handling (if STT lacks it) |
| **Edge Transport** | Stream (default), Local, Tencent | Call routing and media streaming |
| **Telephony** | Twilio, Telnyx | Phone call integration |

## Decision Guidance

### Realtime vs Custom Pipeline

| Scenario | Use Realtime | Use Custom Pipeline |
|----------|--------------|-------------------|
| **Latency critical** | ✓ | — |
| **Need function calling** | — | ✓ |
| **Mix providers** (e.g., Deepgram STT + Gemini LLM + ElevenLabs TTS) | — | ✓ |
| **Fastest to prototype** | ✓ | — |
| **Full control over each stage** | — | ✓ |
| **Phone integration** | Either | Either |

**Realtime example:** `llm=openai.Realtime()` — one API handles speech in/out.  
**Custom example:** `llm=gemini.LLM()`, `stt=deepgram.STT()`, `tts=elevenlabs.TTS()`.

### Deployment Mode

| Goal | Use | Setup |
|------|-----|-------|
| **Local dev/testing** | `uv run agent.py run` | Console mode, browser demo |
| **Single container** | `uv run agent.py serve` | HTTP server, Docker |
| **Multiple replicas** | HTTP server + Redis | Horizontal scaling, session registry |
| **Kubernetes** | HTTP server + Helm | Full orchestration, Prometheus, Grafana |

### RAG Option

| Need | Use | Complexity |
|------|-----|-----------|
| **Quick setup** | Gemini FileSearch | Simple (automatic chunking) |
| **Production, hybrid search** | TurboPuffer | More setup (vector + BM25) |
| **Custom pipeline** | Build your own | Full control |

## Workflow

### 1. Scaffold and Configure

```bash
uvx vision-agents init my-agent && cd my-agent
cp .env.example .env
# Fill in: STREAM_API_KEY, STREAM_API_SECRET, GOOGLE_API_KEY, etc.
```

### 2. Understand the Agent Structure

Open `agent.py` (auto-created). It contains:
- `create_agent(**kwargs)` — Factory function returning configured Agent
- `join_call(agent, call_type, call_id, **kwargs)` — Defines agent behavior on join
- `runner = Runner(AgentLauncher(...))` — Entry point for CLI

### 3. Choose Your LLM Mode

**Realtime (simplest):**
```python
llm=gemini.Realtime()  # or openai.Realtime(), qwen.Realtime()
```

**Custom pipeline (full control):**
```python
llm=gemini.LLM(),
stt=deepgram.STT(eager_turn_detection=True),
tts=elevenlabs.TTS()
```

### 4. Add Tools (Optional)

Register functions for the LLM to call:
```python
@agent.llm.register_function(description="Get weather")
async def get_weather(location: str) -> dict:
    return {"temp": "22C", "condition": "Sunny"}
```

Or connect MCP servers:
```python
agent = Agent(
    ...,
    mcp_servers=[MCPServerRemote(url="...", headers={...})]
)
```

### 5. Test Locally

```bash
uv run agent.py run
# Opens browser demo; talk to your agent
```

### 6. Deploy

**Single container:**
```bash
uv run agent.py serve --host 0.0.0.0 --port 8000
# POST /calls/{call_id}/sessions to spawn agents
```

**Production (Kubernetes):**
- See [Kubernetes Deployment](/guides/kubernetes-deployment)
- Includes Helm chart, Redis session registry, Prometheus metrics

### 7. Monitor

Enable telemetry:
```python
from vision_agents.core import Agent
agent = Agent(...)
# Metrics auto-collected; export via OpenTelemetry
```

View at `http://localhost:9464/metrics` (Prometheus format).

## Common Gotchas

- **Do not reuse Agent instances** — Create a new agent for each call. Calling `join()` twice raises `RuntimeError`.
- **STT with built-in turn detection** — If your STT plugin (e.g., Deepgram, ElevenLabs) has built-in turn detection, do not pass a separate `turn_detection` plugin; the Agent auto-disables it to prevent conflicts.
- **Realtime mode disables STT/TTS** — When using `AudioLLM` (realtime models), STT, TTS, and turn detection are automatically disabled with a warning log.
- **Missing API keys** — Plugins auto-load from `.env`; if a key is missing, the plugin fails silently at runtime. Always verify `.env` is populated.
- **Function calling requires text LLM** — Realtime models do not support `@llm.register_function()`. Use custom pipeline mode for function calling.
- **Interruption handling varies** — Realtime APIs (OpenAI, Gemini, Qwen, AWS Bedrock) have built-in interruption. Custom pipelines need `turn_detection` plugin.
- **Agent idle timeout** — By default, agents disconnect after 60 seconds alone on a call. Set `agent_idle_timeout` in `AgentLauncher` to adjust.
- **Session limits** — HTTP server defaults to unlimited concurrent sessions. Set `max_concurrent_sessions` and `max_sessions_per_call` to prevent resource exhaustion.
- **Video override only in console mode** — `--video-track-override` works with `uv run agent.py run`, not `serve`.
- **Async functions only** — `@llm.register_function()` requires async functions; sync functions raise `ValueError`.

## Verification Checklist

Before submitting agent code:

- [ ] `.env` file populated with all required API keys (STREAM_API_KEY, STREAM_API_SECRET, LLM key, STT key, TTS key)
- [ ] `create_agent()` returns an `Agent` instance with valid `edge`, `llm`, and `agent_user`
- [ ] `join_call()` is async and calls `agent.create_call()`, `agent.join()`, and `agent.finish()`
- [ ] `Runner(AgentLauncher(...))` is instantiated and `runner.cli()` is called in `__main__`
- [ ] Agent tested locally with `uv run agent.py run` and responds to voice input
- [ ] If using custom pipeline: STT, LLM, and TTS plugins are all configured
- [ ] If using realtime mode: only `llm` is set (no STT/TTS)
- [ ] If using function calling: functions are async and have descriptions
- [ ] If using MCP servers: servers are passed to `Agent(mcp_servers=[...])`
- [ ] If deploying: `Dockerfile` exists and `uv run agent.py serve` starts without errors
- [ ] If scaling: Redis session registry configured in `AgentLauncher`
- [ ] Metrics enabled if production deployment (check telemetry setup)

## Resources

**Comprehensive navigation:** https://visionagents.ai/llms.txt

**Critical docs:**
1. [Quickstart](/introduction/quickstart) — 5-minute setup
2. [Voice Agents](/introduction/voice-agents) — Realtime vs custom pipeline decision
3. [HTTP Server](/guides/http-server) — Production deployment and scaling

---

> For additional documentation and navigation, see: https://visionagents.ai/llms.txt