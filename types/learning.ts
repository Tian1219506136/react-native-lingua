export type LanguageCode = "es" | "fr" | "ja" | "ko" | "de" | "zh";

export type LessonLevel = "beginner" | "intermediate" | "advanced";

export type ActivityType =
  | "listen"
  | "speak"
  | "choose"
  | "match"
  | "chat";

export type LessonStatus = "locked" | "available" | "completed";

export type SupportedLanguage = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
  learnersLabel: string;
  learningFrom: "en";
  description: string;
  beginnerGreeting: string;
};

export type VocabularyItem = {
  id: string;
  term: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: "noun" | "verb" | "adjective" | "phrase" | "interjection";
  example?: string;
};

export type PhraseItem = {
  id: string;
  phrase: string;
  translation: string;
  pronunciation?: string;
  usageNote?: string;
};

export type LessonGoal = {
  id: string;
  label: string;
};

export type BaseActivity = {
  id: string;
  type: ActivityType;
  prompt: string;
  xp: number;
};

export type ListenActivity = BaseActivity & {
  type: "listen";
  audioText: string;
  correctAnswer: string;
};

export type SpeakActivity = BaseActivity & {
  type: "speak";
  expectedPhrase: string;
  pronunciationHint?: string;
};

export type ChooseActivity = BaseActivity & {
  type: "choose";
  options: string[];
  correctAnswer: string;
};

export type MatchActivity = BaseActivity & {
  type: "match";
  pairs: {
    left: string;
    right: string;
  }[];
};

export type ChatActivity = BaseActivity & {
  type: "chat";
  starterMessage: string;
  expectedIntent: string;
};

export type LessonActivity =
  | ListenActivity
  | SpeakActivity
  | ChooseActivity
  | MatchActivity
  | ChatActivity;

export type AITeacherPrompt = {
  persona: string;
  lessonBrief: string;
  speakingFocus: string;
  correctionStyle: string;
  fallbackPrompt: string;
};

export type LearningUnit = {
  id: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
};

export type Lesson = {
  id: string;
  unitId: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  level: LessonLevel;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  goals: LessonGoal[];
  vocabulary: VocabularyItem[];
  phrases: PhraseItem[];
  activities: LessonActivity[];
  aiTeacherPrompt: AITeacherPrompt;
};
