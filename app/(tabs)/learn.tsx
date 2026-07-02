import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLessonsByUnit } from "@/data/lessons";
import { getUnitsByLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { colors } from "@/theme/tokens";
import type { LanguageCode, Lesson, LessonStatus } from "@/types/learning";

const fallbackLanguageCode: LanguageCode = "es";
const currentLessonOrder = 3;

function withAlpha(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getLessonStatus(order: number): LessonStatus {
  if (order < currentLessonOrder) {
    return "completed";
  }

  if (order === currentLessonOrder) {
    return "inProgress";
  }

  return "locked";
}

export default function LearnScreen() {
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const [selectedTab, setSelectedTab] = useState<"lessons" | "practice">(
    "lessons",
  );

  const unit = useMemo(() => {
    const selectedUnits = selectedLanguageCode
      ? getUnitsByLanguage(selectedLanguageCode)
      : [];

    return selectedUnits[0] ?? getUnitsByLanguage(fallbackLanguageCode)[0];
  }, [selectedLanguageCode]);

  const unitLessons = useMemo(
    () => (unit ? getLessonsByUnit(unit.id) : []),
    [unit],
  );
  const selectedLesson =
    unitLessons.find((lesson) => lesson.order === currentLessonOrder) ??
    unitLessons[0];
  const completedCount = unitLessons.filter(
    (lesson) => getLessonStatus(lesson.order) === "completed",
  ).length;

  if (!unit || !selectedLesson) {
    return null;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.safeArea}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 bg-lingua-lesson-page"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between px-6 pt-6">
          <Pressable
            accessibilityRole="button"
            className="h-10 w-10 items-start justify-center active:opacity-70"
            onPress={() => (router.canGoBack() ? router.back() : router.push("/(tabs)/home"))}
          >
            <Ionicons
              color={colors.neutral.textPrimary}
              name="chevron-back"
              size={34}
            />
          </Pressable>

          <View className="min-w-0 flex-1 pr-4">
            <Text
              className="font-poppins-semibold text-[22px] leading-[31px] text-lingua-text"
              numberOfLines={1}
            >
              {selectedLesson.title}
            </Text>
            <Text className="mt-1 font-poppins-medium text-[18px] leading-[25px] text-lingua-muted">
              Unit {unit.order} • {completedCount + 1} / {unitLessons.length} lessons
            </Text>
          </View>

          <View className="mt-1 h-9 w-9 items-center justify-center">
            <Ionicons
              color={colors.primary.purple}
              name="bookmark-outline"
              size={34}
            />
          </View>
        </View>

        <View className="relative mt-3 h-[280px] overflow-hidden">
          <Image
            contentFit="cover"
            source={images.lessonCards[selectedLesson.imageKey]}
            style={styles.heroImage}
          />
          <View className="absolute inset-0 bg-lingua-background opacity-20" />
          <Image
            contentFit="contain"
            source={images.mascotWelcome}
            style={styles.mascotImage}
          />
        </View>

        <View
          className="-mt-[54px] overflow-hidden rounded-[22px] bg-lingua-tab-muted"
          style={styles.segmentedControl}
        >
          <Pressable
            accessibilityRole="button"
            className={
              selectedTab === "lessons"
                ? "h-[76px] flex-1 items-center justify-center rounded-[22px] bg-lingua-background"
                : "h-[76px] flex-1 items-center justify-center"
            }
            onPress={() => setSelectedTab("lessons")}
            style={selectedTab === "lessons" ? styles.activeSegment : undefined}
          >
            <Text
              className={
                selectedTab === "lessons"
                  ? "font-poppins-semibold text-[20px] leading-[28px] text-lingua-purple"
                  : "font-poppins-medium text-[20px] leading-[28px] text-lingua-muted"
              }
            >
              Lessons
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className={
              selectedTab === "practice"
                ? "h-[76px] flex-1 items-center justify-center rounded-[22px] bg-lingua-background"
                : "h-[76px] flex-1 items-center justify-center"
            }
            onPress={() => setSelectedTab("practice")}
            style={selectedTab === "practice" ? styles.activeSegment : undefined}
          >
            <Text
              className={
                selectedTab === "practice"
                  ? "font-poppins-semibold text-[20px] leading-[28px] text-lingua-purple"
                  : "font-poppins-medium text-[20px] leading-[28px] text-lingua-muted"
              }
            >
              Practice
            </Text>
          </Pressable>
        </View>

        <View className="mt-7 gap-3 px-6">
          {unitLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/lesson/[lessonId]",
                  params: { lessonId: lesson.id },
                })
              }
              status={getLessonStatus(lesson.order)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type LessonCardProps = {
  lesson: Lesson;
  onPress: () => void;
  status: LessonStatus;
};

function LessonCard({ lesson, onPress, status }: LessonCardProps) {
  const isActive = status === "inProgress";

  return (
    <Pressable
      accessibilityRole="button"
      className={
        isActive
          ? "min-h-[108px] rounded-[18px] border-2 border-lingua-purple bg-lingua-background px-6 py-4 active:opacity-80"
          : "min-h-[92px] rounded-[18px] border border-lingua-track-border bg-lingua-background px-6 py-4 active:opacity-80"
      }
      onPress={onPress}
      style={styles.lessonCard}
    >
      <View className="flex-row items-center">
        <View className="min-w-0 flex-1 pr-4">
          <Text
            className={
              isActive
                ? "font-poppins-semibold text-[15px] leading-[21px] text-lingua-purple"
                : "font-poppins-semibold text-[15px] leading-[21px] text-lingua-muted"
            }
          >
            Lesson {lesson.order}
          </Text>
          <Text
            className="mt-3 font-poppins-medium text-[18px] leading-[25px] text-lingua-text"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text
            className={
              isActive
                ? "mt-1 font-poppins-semibold text-[15px] leading-[21px] text-lingua-purple"
                : "mt-1 font-poppins-medium text-[15px] leading-[21px] text-lingua-muted"
            }
          >
            {status === "completed"
              ? `${lesson.estimatedMinutes} min review`
              : status === "inProgress"
                ? "In progress"
                : `0 / ${lesson.activities.length} lessons`}
          </Text>
        </View>

        <LessonStatusMark lesson={lesson} status={status} />
      </View>
    </Pressable>
  );
}

type LessonStatusMarkProps = {
  lesson: Lesson;
  status: LessonStatus;
};

function LessonStatusMark({ lesson, status }: LessonStatusMarkProps) {
  if (status === "completed") {
    return (
      <View className="h-[31px] w-[31px] items-center justify-center rounded-full bg-lingua-completed">
        <Ionicons
          color={colors.neutral.background}
          name="checkmark"
          size={24}
        />
      </View>
    );
  }

  if (status === "inProgress") {
    return (
      <View className="h-[56px] w-[56px] overflow-hidden rounded-[14px] bg-lingua-lesson-icon-bg">
        <Image
          contentFit="cover"
          source={images.lessonCards[lesson.imageKey]}
          style={styles.cardImage}
        />
      </View>
    );
  }

  return (
    <View className="h-[31px] w-[31px] items-center justify-center">
      <Ionicons
        color={colors.neutral.textSecondary}
        name="lock-closed-outline"
        size={27}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activeSegment: {
    borderCurve: "continuous",
    boxShadow: `0 8px 18px ${withAlpha(colors.primary.purple, 0.12)}`,
  },
  cardImage: {
    height: "100%",
    width: "100%",
  },
  heroImage: {
    height: "100%",
    width: "100%",
  },
  lessonCard: {
    borderCurve: "continuous",
    boxShadow: `0 5px 14px ${withAlpha(colors.neutral.cardShadow, 0.04)}`,
  },
  mascotImage: {
    bottom: -15,
    height: 188,
    left: 126,
    position: "absolute",
    width: 188,
  },
  safeArea: {
    backgroundColor: colors.neutral.lessonPage,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  segmentedControl: {
    borderCurve: "continuous",
    boxShadow: `0 8px 18px ${withAlpha(colors.neutral.cardShadow, 0.08)}`,
    flexDirection: "row",
    marginHorizontal: 14,
  },
});
