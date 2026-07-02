import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLanguageByCode } from "@/data/languages";
import { getLessonById } from "@/data/lessons";
import { colors } from "@/theme/tokens";

function withAlpha(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function AudioLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : null;
  const language = lesson ? getLanguageByCode(lesson.languageCode) : null;

  if (!lesson || !language) {
    return (
      <SafeAreaView style={styles.emptySafeArea}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-poppins-semibold text-[22px] leading-[30px] text-lingua-text">
            Lesson not found
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 h-14 items-center justify-center rounded-[18px] bg-lingua-purple px-8 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="font-poppins-semibold text-[18px] leading-[25px] text-lingua-background">
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const primaryPhrase = lesson.phrases[0];
  const firstGoal = lesson.goals[0];
  const responsePhrase = primaryPhrase?.phrase ?? language.beginnerGreeting;
  const responseTranslation =
    primaryPhrase?.translation ?? lesson.aiTeacherPrompt.lessonBrief;
  const goalLabel = firstGoal?.label ?? lesson.description;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.safeArea}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1 bg-lingua-background"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center px-7 pt-2">
          <Pressable
            accessibilityRole="button"
            className="h-12 w-12 items-start justify-center active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons
              color={colors.neutral.textPrimary}
              name="chevron-back"
              size={34}
            />
          </Pressable>

          <View className="min-w-0 flex-1">
            <Text
              className="font-poppins-semibold text-[23px] leading-[31px] text-lingua-text"
              numberOfLines={1}
            >
              AI Teacher
            </Text>
            <View className="mt-1 flex-row items-center">
              <View className="h-[13px] w-[13px] rounded-full bg-lingua-success" />
              <Text
                className="ml-2 font-poppins-medium text-[17px] leading-[23px] text-lingua-muted"
                numberOfLines={1}
              >
                Online • {language.name}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <HeaderIcon name="videocam" />
            <View className="h-[58px] w-[58px] items-center justify-center rounded-full border border-lingua-audio-divider bg-lingua-background">
              <Text className="font-poppins-semibold text-[22px] leading-[30px] text-lingua-text">
                {lesson.estimatedMinutes + lesson.order}
              </Text>
            </View>
            <HeaderIcon name="notifications-outline" />
          </View>
        </View>

        <LinearGradient
          colors={[colors.neutral.audioStageSoft, colors.neutral.audioOverlay]}
          style={styles.stage}
        >
          <Image
            contentFit="cover"
            source={images.palace}
            style={styles.stageBackground}
          />
          <View className="absolute inset-0 bg-lingua-audio-stage opacity-75" />

          <View className="absolute right-5 top-6 overflow-hidden rounded-[24px] border-2 border-lingua-background bg-lingua-audio-control">
            <Image
              contentFit="contain"
              source={images.mascotLogo}
              style={styles.teacherAvatar}
            />
          </View>

          <View className="absolute left-6 top-6 rounded-full bg-lingua-background/90 px-4 py-2">
            <Text className="font-poppins-semibold text-[12px] leading-[17px] text-lingua-purple">
              Audio session
            </Text>
          </View>

          <Image
            contentFit="contain"
            source={images.mascotWelcome}
            style={styles.mascot}
          />

          <View
            className="absolute bottom-[160px] left-[82px] right-[40px] rounded-[18px] bg-lingua-background px-7 py-5"
            style={styles.responseBubble}
          >
            <Text className="font-poppins-semibold text-[23px] leading-[31px] text-lingua-text">
              {responsePhrase}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text
                className="mr-4 flex-1 font-poppins-medium text-[22px] leading-[29px] text-lingua-text"
                numberOfLines={1}
              >
                {responseTranslation}
              </Text>
              <Ionicons
                color={colors.primary.deepPurple}
                name="volume-high"
                size={34}
              />
            </View>
          </View>
        </LinearGradient>

        <View className="-mt-[145px] px-9">
          <View className="flex-row items-start justify-between">
            <ControlButton
              icon="videocam"
              label="Camera"
              muted
            />
            <ControlButton
              icon="mic"
              label="Mic"
            />
            <ControlButton
              label="Subtitles"
              materialIcon="translate"
            />
            <ControlButton
              icon="call"
              label="End Call"
              tone="danger"
            />
          </View>

          <View
            className="mt-9 rounded-[24px] bg-lingua-background px-5 py-5"
            style={styles.feedbackCard}
          >
            <View className="flex-row">
              <FeedbackColumn
                label="Speaking"
                value="Excellent"
                valueClassName="text-lingua-success"
              />
              <View className="w-px bg-lingua-audio-divider" />
              <FeedbackColumn
                label="Pronunciation"
                value="Great"
                valueClassName="text-lingua-audio-good"
              />
              <View className="w-px bg-lingua-audio-divider" />
              <FeedbackColumn
                label="Grammar"
                value="Good"
                valueClassName="text-lingua-audio-great"
              />
            </View>

            <View className="mt-5 border-t border-lingua-audio-divider pt-4">
              <Text
                className="font-poppins-semibold text-[14px] leading-[20px] text-lingua-text"
                numberOfLines={1}
              >
                {lesson.title} • {goalLabel}
              </Text>
              <Text
                className="mt-2 font-poppins-medium text-[13px] leading-[19px] text-lingua-muted"
                numberOfLines={2}
              >
                {lesson.aiTeacherPrompt.speakingFocus}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type HeaderIconProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
};

function HeaderIcon({ name }: HeaderIconProps) {
  return (
    <View className="h-[58px] w-[58px] items-center justify-center rounded-full border border-lingua-audio-divider bg-lingua-background">
      <Ionicons
        color={colors.neutral.textPrimary}
        name={name}
        size={30}
      />
    </View>
  );
}

type ControlButtonProps = {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  materialIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  muted?: boolean;
  tone?: "default" | "danger";
};

function ControlButton({
  icon,
  label,
  materialIcon,
  muted = false,
  tone = "default",
}: ControlButtonProps) {
  const isDanger = tone === "danger";
  const iconColor = isDanger
    ? colors.neutral.background
    : colors.neutral.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      className="w-[74px] items-center active:opacity-80"
    >
      <View
        className={
          isDanger
            ? "h-[68px] w-[68px] items-center justify-center rounded-full bg-lingua-audio-end"
            : "h-[68px] w-[68px] items-center justify-center rounded-full bg-lingua-audio-control"
        }
        style={styles.controlCircle}
      >
        {materialIcon ? (
          <MaterialCommunityIcons
            color={iconColor}
            name={materialIcon}
            size={34}
          />
        ) : (
          <Ionicons
            color={iconColor}
            name={icon ?? "ellipse"}
            size={34}
          />
        )}
        {muted ? <View className="absolute h-[3px] w-10 rotate-45 rounded-full bg-lingua-muted" /> : null}
      </View>
      <Text className="mt-3 text-center font-poppins-semibold text-[13px] leading-[18px] text-lingua-background">
        {label}
      </Text>
    </Pressable>
  );
}

type FeedbackColumnProps = {
  label: string;
  value: string;
  valueClassName: string;
};

function FeedbackColumn({
  label,
  value,
  valueClassName,
}: FeedbackColumnProps) {
  return (
    <View className="min-h-[80px] flex-1 items-center justify-center px-2">
      <Text
        className="text-center font-poppins-semibold text-[15px] leading-[21px] text-lingua-text"
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className={`mt-3 text-center font-poppins-semibold text-[15px] leading-[21px] ${valueClassName}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  controlCircle: {
    boxShadow: `0 8px 18px ${withAlpha(colors.neutral.cardShadow, 0.1)}`,
  },
  emptySafeArea: {
    backgroundColor: colors.neutral.lessonPage,
    flex: 1,
  },
  feedbackCard: {
    borderCurve: "continuous",
    boxShadow: `0 14px 34px ${withAlpha(colors.neutral.cardShadow, 0.09)}`,
  },
  mascot: {
    bottom: 124,
    height: 362,
    left: 10,
    position: "absolute",
    width: 362,
  },
  responseBubble: {
    borderCurve: "continuous",
    boxShadow: `0 10px 24px ${withAlpha(colors.neutral.cardShadow, 0.18)}`,
  },
  safeArea: {
    backgroundColor: colors.neutral.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  stage: {
    borderCurve: "continuous",
    borderRadius: 28,
    height: 690,
    marginHorizontal: 14,
    marginTop: 28,
    overflow: "hidden",
  },
  stageBackground: {
    height: "100%",
    opacity: 0.32,
    width: "100%",
  },
  teacherAvatar: {
    height: 136,
    width: 136,
  },
});
