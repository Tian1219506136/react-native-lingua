import type { Lesson } from "@/types/learning";

export const lessons: Lesson[] = [
  {
    id: "es-greetings",
    unitId: "es-basics-1",
    languageCode: "es",
    title: "Say Hello",
    description: "Meet someone with a friendly hello and goodbye.",
    level: "beginner",
    order: 1,
    xpReward: 20,
    estimatedMinutes: 4,
    goals: [
      { id: "es-greetings-goal-1", label: "Recognize hola and adios" },
      { id: "es-greetings-goal-2", label: "Say a simple greeting out loud" },
    ],
    vocabulary: [
      {
        id: "es-vocab-hola",
        term: "hola",
        translation: "hello",
        pronunciation: "OH-lah",
        partOfSpeech: "interjection",
        example: "Hola, Ana.",
      },
      {
        id: "es-vocab-adios",
        term: "adios",
        translation: "goodbye",
        pronunciation: "ah-DYOS",
        partOfSpeech: "interjection",
        example: "Adios, Mateo.",
      },
    ],
    phrases: [
      {
        id: "es-phrase-buenos-dias",
        phrase: "Buenos dias",
        translation: "Good morning",
        pronunciation: "BWEH-nos DEE-ahs",
        usageNote: "Use this earlier in the day.",
      },
    ],
    activities: [
      {
        id: "es-greetings-listen-1",
        type: "listen",
        prompt: "Listen and choose what you hear.",
        audioText: "hola",
        correctAnswer: "hello",
        xp: 5,
      },
      {
        id: "es-greetings-choose-1",
        type: "choose",
        prompt: "What does adios mean?",
        options: ["goodbye", "please", "water"],
        correctAnswer: "goodbye",
        xp: 5,
      },
      {
        id: "es-greetings-speak-1",
        type: "speak",
        prompt: "Say hello in Spanish.",
        expectedPhrase: "hola",
        pronunciationHint: "Keep the h silent.",
        xp: 10,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a warm Spanish teacher for absolute beginners.",
      lessonBrief: "Teach hola, adios, and Buenos dias through short audio turns.",
      speakingFocus: "Help the learner pronounce hola with a silent h.",
      correctionStyle: "Give one short correction, then ask the learner to try again.",
      fallbackPrompt: "If the learner is stuck, model the phrase slowly and cheerfully.",
    },
  },
  {
    id: "es-introductions",
    unitId: "es-basics-1",
    languageCode: "es",
    title: "Introduce Yourself",
    description: "Say your name and ask for someone else's name.",
    level: "beginner",
    order: 2,
    xpReward: 25,
    estimatedMinutes: 5,
    goals: [
      { id: "es-introductions-goal-1", label: "Say me llamo with your name" },
      { id: "es-introductions-goal-2", label: "Ask como te llamas" },
    ],
    vocabulary: [
      {
        id: "es-vocab-yo",
        term: "yo",
        translation: "I",
        pronunciation: "yoh",
        partOfSpeech: "noun",
      },
      {
        id: "es-vocab-nombre",
        term: "nombre",
        translation: "name",
        pronunciation: "NOHM-breh",
        partOfSpeech: "noun",
      },
    ],
    phrases: [
      {
        id: "es-phrase-me-llamo",
        phrase: "Me llamo Ana",
        translation: "My name is Ana",
        pronunciation: "meh YAH-moh AH-nah",
      },
      {
        id: "es-phrase-como-te-llamas",
        phrase: "Como te llamas?",
        translation: "What is your name?",
        pronunciation: "KOH-moh teh YAH-mahs",
      },
    ],
    activities: [
      {
        id: "es-introductions-match-1",
        type: "match",
        prompt: "Match each Spanish phrase to English.",
        pairs: [
          { left: "Me llamo Ana", right: "My name is Ana" },
          { left: "Como te llamas?", right: "What is your name?" },
        ],
        xp: 10,
      },
      {
        id: "es-introductions-chat-1",
        type: "chat",
        prompt: "Answer the tutor with your name.",
        starterMessage: "Hola, como te llamas?",
        expectedIntent: "The learner says their name using me llamo.",
        xp: 15,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are an encouraging Spanish tutor practicing introductions.",
      lessonBrief: "Guide the learner through me llamo and como te llamas.",
      speakingFocus: "Keep responses short and make the learner say their own name.",
      correctionStyle: "Correct only the target phrase and avoid grammar lectures.",
      fallbackPrompt: "Offer a fill-in pattern: Me llamo ___ .",
    },
  },
  {
    id: "fr-greetings",
    unitId: "fr-basics-1",
    languageCode: "fr",
    title: "Polite Hellos",
    description: "Greet people politely in French.",
    level: "beginner",
    order: 1,
    xpReward: 20,
    estimatedMinutes: 4,
    goals: [
      { id: "fr-greetings-goal-1", label: "Recognize bonjour and salut" },
      { id: "fr-greetings-goal-2", label: "Choose a polite greeting" },
    ],
    vocabulary: [
      {
        id: "fr-vocab-bonjour",
        term: "bonjour",
        translation: "hello",
        pronunciation: "bohn-ZHOOR",
        partOfSpeech: "interjection",
      },
      {
        id: "fr-vocab-salut",
        term: "salut",
        translation: "hi",
        pronunciation: "sah-LU",
        partOfSpeech: "interjection",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-bonne-journee",
        phrase: "Bonne journee",
        translation: "Have a good day",
        pronunciation: "bun zhoor-NAY",
      },
    ],
    activities: [
      {
        id: "fr-greetings-listen-1",
        type: "listen",
        prompt: "Listen and choose the meaning.",
        audioText: "bonjour",
        correctAnswer: "hello",
        xp: 5,
      },
      {
        id: "fr-greetings-choose-1",
        type: "choose",
        prompt: "Which word means hi?",
        options: ["salut", "merci", "eau"],
        correctAnswer: "salut",
        xp: 5,
      },
      {
        id: "fr-greetings-speak-1",
        type: "speak",
        prompt: "Say hello politely in French.",
        expectedPhrase: "bonjour",
        pronunciationHint: "Let the final r stay soft.",
        xp: 10,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a patient French teacher for new learners.",
      lessonBrief: "Practice bonjour, salut, and Bonne journee in audio turns.",
      speakingFocus: "Help the learner hear the soft French j sound in bonjour.",
      correctionStyle: "Use gentle, short feedback and repeat the phrase once.",
      fallbackPrompt: "If the learner pauses, ask them to repeat bonjour after you.",
    },
  },
  {
    id: "fr-cafe",
    unitId: "fr-basics-1",
    languageCode: "fr",
    title: "At a Cafe",
    description: "Order a coffee and say thank you.",
    level: "beginner",
    order: 2,
    xpReward: 25,
    estimatedMinutes: 5,
    goals: [
      { id: "fr-cafe-goal-1", label: "Ask for coffee politely" },
      { id: "fr-cafe-goal-2", label: "Use merci after ordering" },
    ],
    vocabulary: [
      {
        id: "fr-vocab-cafe",
        term: "cafe",
        translation: "coffee",
        pronunciation: "kah-FAY",
        partOfSpeech: "noun",
      },
      {
        id: "fr-vocab-merci",
        term: "merci",
        translation: "thank you",
        pronunciation: "mehr-SEE",
        partOfSpeech: "phrase",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-un-cafe",
        phrase: "Un cafe, s'il vous plait",
        translation: "A coffee, please",
        pronunciation: "un kah-FAY seel voo PLAY",
      },
    ],
    activities: [
      {
        id: "fr-cafe-match-1",
        type: "match",
        prompt: "Match the cafe words.",
        pairs: [
          { left: "cafe", right: "coffee" },
          { left: "merci", right: "thank you" },
        ],
        xp: 10,
      },
      {
        id: "fr-cafe-chat-1",
        type: "chat",
        prompt: "Order one coffee from the tutor.",
        starterMessage: "Bonjour, vous desirez?",
        expectedIntent: "The learner orders a coffee politely.",
        xp: 15,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a friendly French cafe tutor.",
      lessonBrief: "Role-play ordering one coffee with merci.",
      speakingFocus: "Keep the learner focused on one useful cafe sentence.",
      correctionStyle: "Correct politeness and pronunciation without adding new grammar.",
      fallbackPrompt: "Offer the sentence frame: Un cafe, s'il vous plait.",
    },
  },
  {
    id: "ja-greetings",
    unitId: "ja-basics-1",
    languageCode: "ja",
    title: "Warm Greetings",
    description: "Say hello and goodbye in beginner Japanese.",
    level: "beginner",
    order: 1,
    xpReward: 20,
    estimatedMinutes: 4,
    goals: [
      { id: "ja-greetings-goal-1", label: "Recognize konnichiwa" },
      { id: "ja-greetings-goal-2", label: "Say goodbye with sayonara" },
    ],
    vocabulary: [
      {
        id: "ja-vocab-konnichiwa",
        term: "konnichiwa",
        translation: "hello",
        pronunciation: "kohn-nee-chee-wah",
        partOfSpeech: "interjection",
      },
      {
        id: "ja-vocab-sayonara",
        term: "sayonara",
        translation: "goodbye",
        pronunciation: "sah-yoh-nah-rah",
        partOfSpeech: "interjection",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-hajimemashite",
        phrase: "hajimemashite",
        translation: "nice to meet you",
        pronunciation: "hah-jee-meh-mah-shee-teh",
      },
    ],
    activities: [
      {
        id: "ja-greetings-listen-1",
        type: "listen",
        prompt: "Listen and choose what you hear.",
        audioText: "konnichiwa",
        correctAnswer: "hello",
        xp: 5,
      },
      {
        id: "ja-greetings-choose-1",
        type: "choose",
        prompt: "What does sayonara mean?",
        options: ["goodbye", "yes", "teacher"],
        correctAnswer: "goodbye",
        xp: 5,
      },
      {
        id: "ja-greetings-speak-1",
        type: "speak",
        prompt: "Say hello in Japanese.",
        expectedPhrase: "konnichiwa",
        pronunciationHint: "Use an even rhythm across the syllables.",
        xp: 10,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a calm Japanese teacher for absolute beginners.",
      lessonBrief: "Teach konnichiwa, sayonara, and hajimemashite with audio practice.",
      speakingFocus: "Help the learner say each syllable clearly and evenly.",
      correctionStyle: "Correct rhythm first, then pronunciation.",
      fallbackPrompt: "Break the phrase into syllables and let the learner repeat.",
    },
  },
  {
    id: "ja-classroom",
    unitId: "ja-basics-1",
    languageCode: "ja",
    title: "Yes and No",
    description: "Answer simple classroom questions.",
    level: "beginner",
    order: 2,
    xpReward: 25,
    estimatedMinutes: 5,
    goals: [
      { id: "ja-classroom-goal-1", label: "Use hai for yes" },
      { id: "ja-classroom-goal-2", label: "Use iie for no" },
    ],
    vocabulary: [
      {
        id: "ja-vocab-hai",
        term: "hai",
        translation: "yes",
        pronunciation: "high",
        partOfSpeech: "interjection",
      },
      {
        id: "ja-vocab-iie",
        term: "iie",
        translation: "no",
        pronunciation: "ee-eh",
        partOfSpeech: "interjection",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-wakarimasu",
        phrase: "wakarimasu",
        translation: "I understand",
        pronunciation: "wah-kah-ree-mahss",
      },
    ],
    activities: [
      {
        id: "ja-classroom-match-1",
        type: "match",
        prompt: "Match the answers.",
        pairs: [
          { left: "hai", right: "yes" },
          { left: "iie", right: "no" },
        ],
        xp: 10,
      },
      {
        id: "ja-classroom-chat-1",
        type: "chat",
        prompt: "Reply to the tutor's simple question.",
        starterMessage: "Do you understand? Say hai or iie.",
        expectedIntent: "The learner answers yes or no in Japanese.",
        xp: 15,
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a supportive Japanese classroom tutor.",
      lessonBrief: "Practice yes, no, and I understand in a simple classroom exchange.",
      speakingFocus: "Help the learner respond quickly with hai or iie.",
      correctionStyle: "Keep corrections brief and repeat the learner's correct answer.",
      fallbackPrompt: "Ask a yes or no question and offer two answer choices.",
    },
  },
];

export const getLessonsByLanguage = (languageCode: Lesson["languageCode"]) =>
  lessons
    .filter((lesson) => lesson.languageCode === languageCode)
    .sort((first, second) => first.order - second.order);

export const getLessonsByUnit = (unitId: Lesson["unitId"]) =>
  lessons
    .filter((lesson) => lesson.unitId === unitId)
    .sort((first, second) => first.order - second.order);

export const getLessonById = (id: Lesson["id"]) =>
  lessons.find((lesson) => lesson.id === id);
