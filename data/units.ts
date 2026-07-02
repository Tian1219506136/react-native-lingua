import type { LearningUnit } from "@/types/learning";

export const units: LearningUnit[] = [
  {
    id: "es-basics-1",
    languageCode: "es",
    title: "Spanish Basics 1",
    description: "Say hello, introduce yourself, and recognize simple words.",
    order: 1,
    lessonIds: ["es-greetings", "es-introductions"],
  },
  {
    id: "fr-basics-1",
    languageCode: "fr",
    title: "French Basics 1",
    description: "Use polite greetings and order a simple drink.",
    order: 1,
    lessonIds: ["fr-greetings", "fr-cafe"],
  },
  {
    id: "ja-basics-1",
    languageCode: "ja",
    title: "Japanese Basics 1",
    description: "Practice greetings and simple yes or no responses.",
    order: 1,
    lessonIds: ["ja-greetings", "ja-classroom"],
  },
];

export const getUnitsByLanguage = (languageCode: LearningUnit["languageCode"]) =>
  units
    .filter((unit) => unit.languageCode === languageCode)
    .sort((first, second) => first.order - second.order);
