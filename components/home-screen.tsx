import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { usePostHog } from "posthog-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLanguageByCode } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { getUnitsByLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { colors } from "@/theme/tokens";
import type { LanguageCode, Lesson } from "@/types/learning";

const fallbackLanguageCode: LanguageCode = "es";
const demoDailyXp = 15;

function withAlpha(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getFirstLessonForLanguage(languageCode: LanguageCode) {
  const firstUnit = getUnitsByLanguage(languageCode)[0];

  if (!firstUnit) {
    return null;
  }

  const firstLesson = firstUnit.lessonIds
    .map((lessonId) => lessons.find((lesson) => lesson.id === lessonId))
    .find((lesson): lesson is Lesson => Boolean(lesson));

  return firstLesson ? { lesson: firstLesson, unit: firstUnit } : null;
}

function getUserDisplayName(user: ReturnType<typeof useUser>["user"]) {
  const emailPrefix = user?.primaryEmailAddress?.emailAddress
    .split("@")[0]
    .trim();

  return user?.firstName?.trim() || user?.username?.trim() || emailPrefix || "Alex";
}

export function HomeScreenContent() {
  const { user } = useUser();
  const posthog = usePostHog();
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );

  const selectedLanguage =
    (selectedLanguageCode ? getLanguageByCode(selectedLanguageCode) : null) ??
    getLanguageByCode(fallbackLanguageCode);

  const learningData = useMemo(() => {
    const selectedData = selectedLanguageCode
      ? getFirstLessonForLanguage(selectedLanguageCode)
      : null;

    return selectedData ?? getFirstLessonForLanguage(fallbackLanguageCode);
  }, [selectedLanguageCode]);

  if (!selectedLanguage || !learningData) {
    return null;
  }

  const { lesson: currentLesson, unit: currentUnit } = learningData;
  const learningLanguage =
    getLanguageByCode(currentLesson.languageCode) ?? selectedLanguage;
  const userName = getUserDisplayName(user);
  const greeting = `${selectedLanguage.beginnerGreeting}, ${userName}!`;
  const chatActivity = currentLesson.activities.find(
    (activity) => activity.type === "chat",
  );
  const aiConversationLabel =
    chatActivity?.prompt.replace(/\.$/, "") ?? "Talk about your day";
  const vocabularyCount = currentLesson.vocabulary.length;
  // TEMP: Replace demoDailyXp with persisted lesson-progress XP in the progress/store chapter.
  const dailyGoalProgress = Math.min(demoDailyXp / currentLesson.xpReward, 1);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.safeArea}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 ds-screen"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-lingua-cream">
              <Text className="text-[31px] leading-[36px]">
                {selectedLanguage.flagEmoji}
              </Text>
            </View>
            <Text
              className="min-w-0 flex-1 pl-4 font-poppins-semibold text-[21px] leading-[29px] text-lingua-text"
              numberOfLines={1}
            >
              {greeting} 👋
            </Text>
          </View>

          <View className="ml-4 flex-row items-center gap-5">
            <View className="flex-row items-center gap-2">
              <Text className="text-[30px] leading-[34px]">🔥</Text>
              <Text className="font-poppins-semibold text-[20px] leading-[28px] text-lingua-muted">
                12
              </Text>
            </View>
            <Ionicons
              color={colors.neutral.textPrimary}
              name="notifications-outline"
              size={31}
            />
          </View>
        </View>

        <View
          className="mt-9 h-[156px] overflow-hidden rounded-[20px] bg-lingua-cream px-6 py-5"
          style={styles.softCard}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-poppins-medium text-[18px] leading-[25px] text-lingua-text">
                Daily goal
              </Text>
              <View className="mt-4 flex-row items-end">
                <Text className="font-poppins-bold text-[34px] leading-[39px] text-lingua-text">
                  {demoDailyXp}
                </Text>
                <Text className="pb-1 pl-2 font-poppins-semibold text-[20px] leading-[28px] text-lingua-muted">
                  / {currentLesson.xpReward} XP
                </Text>
              </View>
            </View>

            <Image
              contentFit="contain"
              source={images.treasure}
              style={styles.treasureImage}
            />
          </View>

          <View className="mt-5 h-3 overflow-hidden rounded-full bg-lingua-goal-track">
            <View
              className="h-full rounded-full bg-lingua-streak"
              style={{ width: `${dailyGoalProgress * 100}%` }}
            />
          </View>
        </View>

        <LinearGradient
          colors={[colors.primary.heroPurpleStart, colors.primary.heroPurpleEnd]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.learningCard}
        >
          <View className="z-10 flex-1 justify-between py-7 pl-6">
            <View>
              <Text className="font-poppins-semibold text-[20px] leading-[28px] text-white">
                Continue learning
              </Text>
              <Text className="mt-3 font-poppins text-[30px] leading-[37px] text-white">
                {learningLanguage.name}
              </Text>
              <Text className="mt-1 font-poppins text-[21px] leading-[29px] text-white">
                A1 · Unit {currentUnit.order}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-[60px] w-[130px] items-center justify-center rounded-[18px] bg-white active:opacity-80"
              onPress={() =>
                posthog.capture("lesson_continue_entry_clicked", {
                  language_code: currentLesson.languageCode,
                  lesson_id: currentLesson.id,
                  unit_id: currentUnit.id,
                })
              }
            >
              <Text className="font-poppins-semibold text-[20px] leading-[28px] text-lingua-purple">
                Continue
              </Text>
            </Pressable>
          </View>

          <View className="absolute bottom-0 right-0 h-full w-[52%] overflow-hidden">
            <View className="absolute bottom-0 left-2 h-[54px] w-[220px] -rotate-[2deg] rounded-t-full bg-lingua-deep-purple opacity-50" />
            <View className="absolute bottom-0 right-[-8px] h-[110px] w-[150px] rounded-t-full bg-lingua-purple opacity-40" />
            <Image
              contentFit="contain"
              source={images.palace}
              style={styles.palaceImage}
            />
          </View>
        </LinearGradient>

        <View className="mt-8 flex-row items-center justify-between">
          <Text className="font-poppins-semibold text-[22px] leading-[29px] text-lingua-text">
            Today&apos;s plan
          </Text>
          <Text className="font-poppins-semibold text-[20px] leading-[28px] text-lingua-purple">
            View all
          </Text>
        </View>

        <View className="mt-5 gap-5">
          <PlanRow
            iconName="book"
            iconTone="purple"
            isDone
            subtitle={currentLesson.title}
            title="Lesson"
          />
          <PlanRow
            iconName="headset"
            iconTone="purple"
            subtitle={aiConversationLabel}
            title="AI Conversation"
          />
          <PlanRow
            iconName="chatbox-ellipses"
            iconTone="coral"
            subtitle={`${vocabularyCount} ${
              vocabularyCount === 1 ? "word" : "words"
            }`}
            title="New words"
          />
        </View>

        <View
          className="mt-8 h-[142px] flex-row items-center rounded-[20px] bg-lingua-plan-green px-6"
          style={styles.softCard}
        >
          <View className="min-w-0 flex-1">
            <Text className="font-poppins-medium text-[18px] leading-[25px] text-lingua-muted">
              Next up
            </Text>
            <Text className="mt-2 font-poppins-bold text-[22px] leading-[29px] text-lingua-text">
              AI Video Call
            </Text>
            <Text className="mt-1 font-poppins-medium text-[16px] leading-[23px] text-lingua-muted">
              Practice speaking
            </Text>
          </View>

          <View className="flex-row items-center">
            <Image
              contentFit="cover"
              source={images.aiTeacherAvatar}
              style={styles.teacherImage}
            />
            <View className="-ml-2 h-[58px] w-[58px] items-center justify-center rounded-full bg-lingua-green">
              <Ionicons
                color={colors.neutral.background}
                name="videocam"
                size={30}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PlanRowProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconTone: "coral" | "purple";
  isDone?: boolean;
  subtitle: string;
  title: string;
};

function PlanRow({
  iconName,
  iconTone,
  isDone = false,
  subtitle,
  title,
}: PlanRowProps) {
  return (
    <View className="h-[66px] flex-row items-center">
      <View
        className={
          iconTone === "purple"
            ? "h-[54px] w-[54px] items-center justify-center rounded-[12px] bg-lingua-purple"
            : "h-[54px] w-[54px] items-center justify-center rounded-[12px] bg-lingua-error"
        }
      >
        <Ionicons
          color={colors.neutral.background}
          name={iconName}
          size={32}
        />
      </View>

      <View className="min-w-0 flex-1 px-6">
        <Text
          className="font-poppins-semibold text-[18px] leading-[25px] text-lingua-text"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="mt-1 font-poppins text-[16px] leading-[22px] text-lingua-muted"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {isDone ? (
        <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-lingua-purple">
          <Ionicons
            color={colors.neutral.background}
            name="checkmark"
            size={23}
          />
        </View>
      ) : (
        <View className="h-[32px] w-[32px] rounded-full border-2 border-lingua-muted" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  learningCard: {
    borderCurve: "continuous",
    borderRadius: 20,
    boxShadow: `0 8px 18px ${withAlpha(colors.primary.purple, 0.16)}`,
    height: 216,
    marginTop: 28,
    overflow: "hidden",
  },
  palaceImage: {
    bottom: -11,
    height: 206,
    position: "absolute",
    right: -8,
    width: 212,
  },
  safeArea: {
    backgroundColor: colors.neutral.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 22,
    paddingHorizontal: 31,
    paddingTop: 18,
  },
  softCard: {
    borderCurve: "continuous",
    boxShadow: `0 6px 16px ${withAlpha(colors.neutral.textPrimary, 0.04)}`,
  },
  teacherImage: {
    borderColor: colors.neutral.background,
    borderRadius: 47,
    borderWidth: 5,
    height: 94,
    width: 94,
  },
  treasureImage: {
    height: 102,
    marginRight: -1,
    width: 122,
  },
});
