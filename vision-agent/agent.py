from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from getstream.video.rtc import PcmData
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.core.edge.types import Participant
from vision_agents.core.instructions import Instructions
from vision_agents.core.utils.audio_filter import AudioFilter
from vision_agents.plugins import getstream, openai

ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
LOCAL_ENV = Path(__file__).resolve().parent / ".env"
load_dotenv(ROOT_ENV)
# Local vision-agent/.env wins over the root .env (the tutorial convention
# puts OPENAI_API_KEY here), so either placement works.
load_dotenv(LOCAL_ENV, override=True)

TARGET_LANGUAGE_FALLBACK = "the selected language"

INSTRUCTIONS = """
You are Lingua's AI language teacher.

Always speak English by default.
Teach the selected language through English, using short friendly explanations.
Keep each spoken turn concise enough for a mobile audio lesson.
Ask one small practice question at a time.
Correct mistakes gently, then give the learner a better example.
Do not switch the teaching language unless the learner explicitly asks.
""".strip()


class PassThroughAudioFilter(AudioFilter):
    async def process_audio(
        self, pcm: PcmData, participant: Participant
    ) -> Optional[PcmData]:
        return pcm

    def clear(self, participant: Optional[Participant] = None) -> None:
        return None


async def create_agent(**kwargs) -> Agent:
    language_name = kwargs.get("language_name") or TARGET_LANGUAGE_FALLBACK

    return Agent(
        edge=getstream.Edge(),
        agent_user=User(id="lingua-ai-teacher", name="Lingua AI Teacher"),
        instructions=(
            f"{INSTRUCTIONS}\n\n"
            f"The learner selected {language_name}. "
            f"Teach {language_name} through English."
        ),
        llm=openai.Realtime(send_video=False),
        multi_speaker_filter=PassThroughAudioFilter(),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)
    lesson_context = await get_lesson_context(call)
    agent.instructions = Instructions(
        input_text=build_agent_instructions(lesson_context)
    )
    language_name = (
        lesson_context["language_name"]
        or kwargs.get("language_name")
        or TARGET_LANGUAGE_FALLBACK
    )
    lesson_title = lesson_context["lesson_title"] or kwargs.get("lesson_title")
    focus = lesson_context["speaking_focus"]

    async with agent.join(call, participant_wait_timeout=10.0):
        lesson_phrase = (
            f" for the lesson {lesson_title}" if lesson_title else ""
        )
        await agent.simple_response(
            text=(
                "Greet the learner warmly in English as their Lingua teacher. "
                f"Say that today you're practicing {language_name}{lesson_phrase}, "
                f"then use this focus: {focus}. "
                "Sound like a real teacher: upbeat, human, and brief. "
                "Use only this lesson's goal, vocabulary, phrases, and context; "
                "mostly speak English, say target-language words slowly with "
                "translations, and start with one tiny repeat-after-me question."
            )
        )
        await agent.finish()


async def get_lesson_context(call) -> dict[str, object]:
    try:
        response = await call.get()
        response_call = getattr(getattr(response, "data", None), "call", None)
        custom = getattr(response_call, "custom", None)
        if not isinstance(custom, dict):
            custom = getattr(call, "custom_data", {})
    except Exception:
        custom = getattr(call, "custom_data", {})

    if not isinstance(custom, dict):
        custom = {}

    ai_teacher_prompt = get_dict(custom.get("aiTeacherPrompt"))

    return {
        "ai_teacher_prompt": ai_teacher_prompt,
        "fallback_prompt": get_string(ai_teacher_prompt.get("fallbackPrompt")),
        "goals": get_labels(custom.get("goals"), "label"),
        "language_name": get_string(custom.get("languageName")),
        "language_native_name": get_string(custom.get("languageNativeName")),
        "lesson_description": get_string(custom.get("lessonDescription")),
        "lesson_level": get_string(custom.get("lessonLevel")),
        "lesson_title": get_string(custom.get("lessonTitle")),
        "lesson_brief": get_string(ai_teacher_prompt.get("lessonBrief")),
        "persona": get_string(ai_teacher_prompt.get("persona")),
        "phrases": get_phrase_lines(custom.get("phrases")),
        "speaking_focus": get_string(ai_teacher_prompt.get("speakingFocus"))
        or "one clear beginner practice phrase",
        "correction_style": get_string(ai_teacher_prompt.get("correctionStyle")),
        "vocabulary": get_vocabulary_lines(custom.get("vocabulary")),
    }


def get_string(value: object) -> Optional[str]:
    return value if isinstance(value, str) and value.strip() else None


def get_dict(value: object) -> dict:
    return value if isinstance(value, dict) else {}


def get_labels(value: object, key: str) -> list[str]:
    if not isinstance(value, list):
        return []

    labels = []
    for item in value:
        if isinstance(item, dict):
            label = get_string(item.get(key))
            if label:
                labels.append(label)
    return labels


def get_vocabulary_lines(value: object) -> list[str]:
    if not isinstance(value, list):
        return []

    lines = []
    for item in value:
        if not isinstance(item, dict):
            continue

        term = get_string(item.get("term"))
        translation = get_string(item.get("translation"))
        pronunciation = get_string(item.get("pronunciation"))
        example = get_string(item.get("example"))
        if not term:
            continue

        parts = [term]
        if translation:
            parts.append(f"means {translation}")
        if pronunciation:
            parts.append(f"pronounced {pronunciation}")
        if example:
            parts.append(f"example: {example}")
        lines.append("; ".join(parts))
    return lines


def get_phrase_lines(value: object) -> list[str]:
    if not isinstance(value, list):
        return []

    lines = []
    for item in value:
        if not isinstance(item, dict):
            continue

        phrase = get_string(item.get("phrase"))
        translation = get_string(item.get("translation"))
        pronunciation = get_string(item.get("pronunciation"))
        usage_note = get_string(item.get("usageNote"))
        if not phrase:
            continue

        parts = [phrase]
        if translation:
            parts.append(f"means {translation}")
        if pronunciation:
            parts.append(f"pronounced {pronunciation}")
        if usage_note:
            parts.append(usage_note)
        lines.append("; ".join(parts))
    return lines


def build_agent_instructions(context: dict[str, object]) -> str:
    language_name = context["language_name"] or TARGET_LANGUAGE_FALLBACK
    language_native_name = context["language_native_name"]
    lesson_title = context["lesson_title"] or "the selected lesson"
    lesson_description = context["lesson_description"]
    goals = context["goals"]
    vocabulary = context["vocabulary"]
    phrases = context["phrases"]

    lines = [
        INSTRUCTIONS,
        "",
        f"Selected language: {language_name}.",
        f"Native language name: {language_native_name or language_name}.",
        f"Current lesson: {lesson_title}.",
    ]

    if lesson_description:
        lines.append(f"Lesson description: {lesson_description}.")
    if context["lesson_brief"]:
        lines.append(f"Lesson brief: {context['lesson_brief']}.")
    if context["persona"]:
        lines.append(f"Persona: {context['persona']}.")
    if context["speaking_focus"]:
        lines.append(f"Speaking focus: {context['speaking_focus']}.")
    if context["correction_style"]:
        lines.append(f"Correction style: {context['correction_style']}.")
    if context["fallback_prompt"]:
        lines.append(f"Fallback prompt: {context['fallback_prompt']}.")

    append_section(lines, "Lesson goals", goals)
    append_section(lines, "Vocabulary", vocabulary)
    append_section(lines, "Phrases", phrases)

    lines.extend(
        [
            "",
            "Stay strictly inside this lesson context.",
            "Do not teach unrelated vocabulary, unrelated grammar, or another language.",
            "Use one or two short conversational sentences per turn.",
            "Mostly speak English; introduce target-language words slowly with translations.",
            "Ask the learner to repeat or try one small answer before moving on.",
        ]
    )

    return "\n".join(lines)


def append_section(lines: list[str], title: str, values: object) -> None:
    if not isinstance(values, list) or not values:
        return

    lines.append("")
    lines.append(f"{title}:")
    for value in values:
        if isinstance(value, str):
            lines.append(f"- {value}")


runner = Runner(
    AgentLauncher(
        create_agent=create_agent,
        join_call=join_call,
        agent_idle_timeout=60.0,
    )
)


if __name__ == "__main__":
    runner.cli()
