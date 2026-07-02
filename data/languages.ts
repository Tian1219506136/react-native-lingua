import type { SupportedLanguage } from "@/types/learning";

export const supportedLanguages: SupportedLanguage[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    learnersLabel: "28.4M learners",
    learningFrom: "en",
    description: "Start with friendly greetings and everyday travel basics.",
    beginnerGreeting: "Hola",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flagEmoji: "🇫🇷",
    learnersLabel: "19.4M learners",
    learningFrom: "en",
    description: "Learn polite phrases for simple cafe and city conversations.",
    beginnerGreeting: "Bonjour",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flagEmoji: "🇯🇵",
    learnersLabel: "12.7M learners",
    learningFrom: "en",
    description: "Practice warm greetings and simple classroom phrases.",
    beginnerGreeting: "Konnichiwa",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flagEmoji: "🇰🇷",
    learnersLabel: "9.3M learners",
    learningFrom: "en",
    description: "Learn everyday greetings and simple Korean phrases.",
    beginnerGreeting: "Annyeonghaseyo",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flagEmoji: "🇩🇪",
    learnersLabel: "8.1M learners",
    learningFrom: "en",
    description: "Practice clear greetings and simple travel basics.",
    beginnerGreeting: "Hallo",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flagEmoji: "🇨🇳",
    learnersLabel: "7.4M learners",
    learningFrom: "en",
    description: "Start with friendly Mandarin greetings and classroom basics.",
    beginnerGreeting: "Ni hao",
  },
];

export const getLanguageByCode = (code: SupportedLanguage["code"]) =>
  supportedLanguages.find((language) => language.code === code);
