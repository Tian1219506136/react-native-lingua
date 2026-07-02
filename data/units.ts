import type { LearningUnit } from "@/types/learning";

export const units: LearningUnit[] = [
  {
    id: "es-basics-1",
    languageCode: "es",
    title: "Spanish Basics 1",
    description: "Say hello, introduce yourself, and recognize simple words.",
    order: 1,
    lessonIds: [
      "es-greetings",
      "es-introductions",
      "es-daily-life",
      "es-travel",
      "es-shopping",
      "es-family",
    ],
  },
  {
    id: "fr-basics-1",
    languageCode: "fr",
    title: "French Basics 1",
    description: "Use polite greetings and order a simple drink.",
    order: 1,
    lessonIds: [
      "fr-greetings",
      "fr-cafe",
      "fr-daily-life",
      "fr-travel",
      "fr-shopping",
      "fr-family",
    ],
  },
  {
    id: "ja-basics-1",
    languageCode: "ja",
    title: "Japanese Basics 1",
    description: "Practice greetings and simple yes or no responses.",
    order: 1,
    lessonIds: [
      "ja-greetings",
      "ja-classroom",
      "ja-daily-life",
      "ja-travel",
      "ja-shopping",
      "ja-family",
    ],
  },
  {
    id: "ko-basics-1",
    languageCode: "ko",
    title: "Korean Basics 1",
    description: "Practice warm greetings, daily phrases, and simple outings.",
    order: 1,
    lessonIds: [
      "ko-greetings",
      "ko-introductions",
      "ko-daily-life",
      "ko-food",
      "ko-shopping",
      "ko-family",
    ],
  },
  {
    id: "de-basics-1",
    languageCode: "de",
    title: "German Basics 1",
    description: "Learn greetings, cafe phrases, travel words, and family talk.",
    order: 1,
    lessonIds: [
      "de-greetings",
      "de-introductions",
      "de-cafe",
      "de-travel",
      "de-shopping",
      "de-family",
    ],
  },
  {
    id: "zh-basics-1",
    languageCode: "zh",
    title: "Chinese Basics 1",
    description: "Start with Mandarin greetings, classroom words, and daily plans.",
    order: 1,
    lessonIds: [
      "zh-greetings",
      "zh-introductions",
      "zh-classroom",
      "zh-food",
      "zh-shopping",
      "zh-family",
    ],
  },
];

export const getUnitsByLanguage = (languageCode: LearningUnit["languageCode"]) =>
  units
    .filter((unit) => unit.languageCode === languageCode)
    .sort((first, second) => first.order - second.order);
