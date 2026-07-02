import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import {
  CallingState,
  StreamCall,
  type Call,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLinguaStreamVideo } from "@/components/StreamVideoProvider";
import { images } from "@/constants/images";
import { getLanguageByCode } from "@/data/languages";
import { getLessonById } from "@/data/lessons";
import { fetchStreamAudioSession } from "@/lib/streamAudio";
import { useLanguageStore } from "@/store/languageStore";
import { colors } from "@/theme/tokens";
import type { Lesson, SupportedLanguage } from "@/types/learning";

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
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const selectedLanguage = selectedLanguageCode
    ? getLanguageByCode(selectedLanguageCode)
    : null;
  const lessonLanguage = lesson ? getLanguageByCode(lesson.languageCode) : null;
  const language =
    selectedLanguage?.code === lesson?.languageCode
      ? selectedLanguage
      : lessonLanguage;
  const streamClient = useStreamVideoClient();
  const streamVideo = useLinguaStreamVideo();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<AudioCallStatus>("idle");
  const [callError, setCallError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeCall?.state.callingState !== CallingState.LEFT) {
        void activeCall?.leave().catch((error) => {
          console.error("Failed to leave Stream audio call:", error);
        });
      }
    };
  }, [activeCall]);

  const handleStartAudioCall = useCallback(async () => {
    if (!lesson || !language) {
      return;
    }

    if (!streamClient) {
      setCallStatus("error");
      setCallError(
        streamVideo.error ?? "Stream is still connecting. Try again in a moment.",
      );
      return;
    }

    setCallStatus("connecting");
    setCallError(null);

    let nextCall: Call | null = null;

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error("Sign in again to start the audio lesson.");
      }

      const session = await fetchStreamAudioSession({
        clerkToken,
        payload: {
          intent: "call",
          languageCode: language.code,
          lessonId: lesson.id,
          userImage: user?.imageUrl,
          userName:
            user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? null,
        },
      });

      if (!session.callId) {
        throw new Error("The Stream call id was not returned.");
      }

      setCallStatus("joining");
      const call = streamClient.call(
        session.callType ?? "default",
        session.callId,
        { reuseInstance: true },
      );
      nextCall = call;
      setActiveCall(nextCall);
      nextCall.setDisconnectionTimeout(120);
      await nextCall.join({ maxJoinRetries: 1 });
      await nextCall.camera.disable();
      setCallStatus("joined");
    } catch (error) {
      if (nextCall?.state.callingState !== CallingState.LEFT) {
        await nextCall?.leave().catch((leaveError) => {
          console.error("Failed to clean up Stream audio call:", leaveError);
        });
      }

      setActiveCall(null);
      setCallStatus("error");
      setCallError(getErrorMessage(error));
    }
  }, [getToken, language, lesson, streamClient, streamVideo.error, user]);

  const handleEndAudioCall = useCallback(async () => {
    if (!activeCall) {
      setCallStatus("ended");
      return;
    }

    try {
      if (activeCall.state.callingState !== CallingState.LEFT) {
        await activeCall.leave();
      }
      setCallStatus("ended");
      setActiveCall(null);
    } catch (error) {
      setCallStatus("error");
      setCallError(getErrorMessage(error));
    }
  }, [activeCall]);

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

  const userName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Signed-in learner";

  if (activeCall) {
    return (
      <StreamCall call={activeCall}>
        <ConnectedAudioLessonView
          callError={callError}
          callStatus={callStatus}
          language={language}
          lesson={lesson}
          onEndAudioCall={handleEndAudioCall}
          onStartAudioCall={handleStartAudioCall}
          streamError={streamVideo.error}
          streamIsConnecting={streamVideo.isConnecting}
          userName={userName}
        />
      </StreamCall>
    );
  }

  return (
    <AudioLessonView
      callError={callError}
      callStatus={callStatus}
      isMicMuted
      language={language}
      lesson={lesson}
      onEndAudioCall={handleEndAudioCall}
      onStartAudioCall={handleStartAudioCall}
      streamError={streamVideo.error}
      streamIsConnecting={streamVideo.isConnecting}
      userName={userName}
    />
  );
}

type AudioCallStatus =
  | "connecting"
  | "ended"
  | "error"
  | "idle"
  | "joined"
  | "joining";

type AudioLessonViewProps = {
  callError: string | null;
  callStatus: AudioCallStatus;
  isMicMuted: boolean;
  isSpeakingWhileMuted?: boolean;
  language: SupportedLanguage;
  lesson: Lesson;
  onEndAudioCall: () => void;
  onStartAudioCall: () => void;
  onToggleMic?: () => void;
  participantCount?: number;
  streamError: string | null;
  streamIsConnecting: boolean;
  userName: string;
};

function ConnectedAudioLessonView(
  props: Omit<AudioLessonViewProps, "isMicMuted">,
) {
  const call = useCall();
  const {
    useCallCallingState,
    useMicrophoneState,
    useParticipantCount,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const {
    isSpeakingWhileMuted,
    optimisticIsMute,
    status: micStatus,
  } = useMicrophoneState();
  const isMicMuted = optimisticIsMute ?? micStatus === "disabled";

  const toggleMic = useCallback(async () => {
    await call?.microphone.toggle();
  }, [call]);

  const derivedStatus =
    callingState === CallingState.JOINED
      ? "joined"
      : callingState === CallingState.JOINING ||
          callingState === CallingState.RECONNECTING
        ? "joining"
        : callingState === CallingState.LEFT
          ? "ended"
          : props.callStatus;

  return (
    <AudioLessonView
      {...props}
      callStatus={derivedStatus}
      isMicMuted={isMicMuted}
      isSpeakingWhileMuted={isSpeakingWhileMuted}
      onToggleMic={toggleMic}
      participantCount={participantCount}
    />
  );
}

function AudioLessonView({
  callError,
  callStatus,
  isMicMuted,
  isSpeakingWhileMuted,
  language,
  lesson,
  onEndAudioCall,
  onStartAudioCall,
  onToggleMic,
  participantCount,
  streamError,
  streamIsConnecting,
  userName,
}: AudioLessonViewProps) {
  const primaryPhrase = lesson.phrases[0];
  const firstGoal = lesson.goals[0];
  const responsePhrase = primaryPhrase?.phrase ?? language.beginnerGreeting;
  const responseTranslation =
    primaryPhrase?.translation ?? lesson.aiTeacherPrompt.lessonBrief;
  const goalLabel = firstGoal?.label ?? lesson.description;
  const statusLabel = getCallStatusLabel({
    callStatus,
    participantCount,
    streamIsConnecting,
  });
  const helperMessage =
    callError ??
    streamError ??
    (isSpeakingWhileMuted ? "You're speaking while muted." : null);
  const isBusy = callStatus === "connecting" || callStatus === "joining";
  const hasJoined = callStatus === "joined";

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
                {statusLabel} • {language.name}
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
              {hasJoined ? "Live audio" : "Audio session"}
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
              onPress={() => undefined}
            />
            <ControlButton
              icon="mic"
              label={isMicMuted ? "Unmute" : "Mute"}
              muted={isMicMuted}
              onPress={onToggleMic}
            />
            <ControlButton
              label="Subtitles"
              materialIcon="translate"
            />
            <ControlButton
              icon="call"
              label={hasJoined || isBusy ? "End Call" : "Start"}
              loading={isBusy}
              onPress={hasJoined || isBusy ? onEndAudioCall : onStartAudioCall}
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
                className="font-poppins-semibold text-[13px] leading-[19px] text-lingua-muted"
                numberOfLines={1}
              >
                {userName} • {statusLabel}
              </Text>
              <Text
                className="mt-2 font-poppins-semibold text-[14px] leading-[20px] text-lingua-text"
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
              {helperMessage ? (
                <Text className="mt-2 font-poppins-medium text-[12px] leading-[18px] text-lingua-error">
                  {helperMessage}
                </Text>
              ) : null}
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
  loading?: boolean;
  onPress?: () => void;
  tone?: "default" | "danger";
};

function ControlButton({
  icon,
  label,
  loading = false,
  materialIcon,
  muted = false,
  onPress,
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
      disabled={!onPress || loading}
      onPress={onPress}
    >
      <View
        className={
          isDanger
            ? "h-[68px] w-[68px] items-center justify-center rounded-full bg-lingua-audio-end"
            : "h-[68px] w-[68px] items-center justify-center rounded-full bg-lingua-audio-control"
        }
        style={styles.controlCircle}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : materialIcon ? (
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

function getCallStatusLabel({
  callStatus,
  participantCount,
  streamIsConnecting,
}: {
  callStatus: AudioCallStatus;
  participantCount?: number;
  streamIsConnecting: boolean;
}) {
  if (streamIsConnecting) {
    return "Connecting";
  }

  if (callStatus === "connecting") {
    return "Creating call";
  }

  if (callStatus === "joining") {
    return "Joining";
  }

  if (callStatus === "joined") {
    return `${participantCount ?? 1} joined`;
  }

  if (callStatus === "ended") {
    return "Ended";
  }

  if (callStatus === "error") {
    return "Needs retry";
  }

  return "Ready";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to start the audio lesson.";
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
