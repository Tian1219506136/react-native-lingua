import { Ionicons } from "@expo/vector-icons";
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
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLinguaStreamVideo } from "@/components/StreamVideoProvider";
import { images } from "@/constants/images";
import { getLanguageByCode } from "@/data/languages";
import { getLessonById } from "@/data/lessons";
import {
  fetchStreamAudioSession,
  startStreamAgentSession,
  stopStreamAgentSession,
  type StreamAgentSession,
} from "@/lib/streamAudio";
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
  const [agentSession, setAgentSession] = useState<StreamAgentSession | null>(
    null,
  );
  const [agentStatus, setAgentStatus] = useState<AgentConnectionStatus>("idle");
  const [callStatus, setCallStatus] = useState<AudioCallStatus>("idle");
  const [callError, setCallError] = useState<string | null>(null);
  const activeCallRef = useRef<Call | null>(null);
  const agentSessionRef = useRef<StreamAgentSession | null>(null);
  const getTokenRef = useRef(getToken);
  const isMountedRef = useRef(true);

  activeCallRef.current = activeCall;
  agentSessionRef.current = agentSession;
  getTokenRef.current = getToken;

  const stopCurrentAgentSession = useCallback(async () => {
    const currentAgentSession = agentSessionRef.current;
    if (!currentAgentSession) {
      if (isMountedRef.current) {
        setAgentStatus("idle");
      }
      return;
    }

    try {
      const clerkToken = await getTokenRef.current();
      if (clerkToken) {
        await stopStreamAgentSession({
          callId: currentAgentSession.callId,
          clerkToken,
          sessionId: currentAgentSession.sessionId,
        });
      }
    } catch (error) {
      console.error("Failed to stop Vision Agent session:", error);
    } finally {
      agentSessionRef.current = null;
      if (isMountedRef.current) {
        setAgentSession(null);
        setAgentStatus("idle");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      void stopCurrentAgentSession();

      const currentCall = activeCallRef.current;
      if (currentCall?.state.callingState !== CallingState.LEFT) {
        void currentCall?.leave().catch((error) => {
          console.error("Failed to leave Stream audio call:", error);
        });
      }
    };
  }, [stopCurrentAgentSession]);

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
    setAgentStatus("idle");
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
      activeCallRef.current = nextCall;
      setActiveCall(nextCall);
      nextCall.setDisconnectionTimeout(120);
      await nextCall.join({ maxJoinRetries: 1 });
      await nextCall.camera.disable();
      setCallStatus("joined");

      setAgentStatus("connecting");
      try {
        const nextAgentSession = await startStreamAgentSession({
          callId: session.callId,
          callType: session.callType ?? "audio_room",
          clerkToken,
        });
        agentSessionRef.current = nextAgentSession;
        setAgentSession(nextAgentSession);
        setAgentStatus("connected");
      } catch (agentError) {
        setAgentStatus("failed");
        setCallError(getErrorMessage(agentError));
      }
    } catch (error) {
      await stopCurrentAgentSession();

      if (nextCall?.state.callingState !== CallingState.LEFT) {
        await nextCall?.leave().catch((leaveError) => {
          console.error("Failed to clean up Stream audio call:", leaveError);
        });
      }

      setActiveCall(null);
      setCallStatus("error");
      setAgentStatus("failed");
      setCallError(getErrorMessage(error));
    }
  }, [
    getToken,
    language,
    lesson,
    stopCurrentAgentSession,
    streamClient,
    streamVideo.error,
    user,
  ]);

  const handleEndAudioCall = useCallback(async () => {
    if (!activeCall) {
      await stopCurrentAgentSession();
      setCallStatus("ended");
      return;
    }

    try {
      await stopCurrentAgentSession();
      if (activeCall.state.callingState !== CallingState.LEFT) {
        await activeCall.leave();
      }
      setCallStatus("ended");
      setActiveCall(null);
    } catch (error) {
      setCallStatus("error");
      setCallError(getErrorMessage(error));
    }
  }, [activeCall, stopCurrentAgentSession]);

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
          agentStatus={agentStatus}
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
      agentStatus={agentStatus}
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

type AgentConnectionStatus = "connected" | "connecting" | "failed" | "idle";

type AudioLessonViewProps = {
  agentStatus: AgentConnectionStatus;
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
    try {
      await call?.microphone.toggle();
    } catch (error) {
      Alert.alert(
        "Microphone unavailable",
        error instanceof Error
          ? error.message
          : "Check the app's microphone permission in Settings.",
      );
    }
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
  language,
  onEndAudioCall,
  onStartAudioCall,
  onToggleMic,
  streamError,
  streamIsConnecting,
}: AudioLessonViewProps) {
  const headerStatusLabel = getHeaderStatusLabel({
    callStatus,
    streamIsConnecting,
  });
  const stageStatusLabel = getStageStatusLabel(callStatus);
  const errorMessage =
    callStatus === "error" ? callError ?? streamError : null;
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
        <View className="relative h-[68px] justify-center px-7 pt-2">
          <Pressable
            accessibilityRole="button"
            className="absolute left-7 top-2 h-12 w-12 items-start justify-center active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons
              color={colors.neutral.textPrimary}
              name="chevron-back"
              size={34}
            />
          </Pressable>

          <View className="absolute left-0 right-0 top-2 items-center">
            <Text
              className="font-poppins-semibold text-[25px] leading-[33px] text-lingua-text"
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
                {headerStatusLabel}
              </Text>
            </View>
          </View>

          <View className="absolute right-7 top-2 flex-row items-center gap-3">
            <View className="h-11 flex-row items-center rounded-full border border-lingua-audio-divider bg-lingua-background px-4">
              <Text className="font-poppins-semibold text-[14px] leading-[20px] text-lingua-text">
                🎧 Audio
              </Text>
            </View>
            <HeaderIcon name="notifications-outline" />
          </View>
        </View>

        <View className="mx-[14px] mt-8 overflow-hidden rounded-[28px] bg-lingua-soft-purple" style={styles.stage}>
          <Image
            contentFit="contain"
            source={images.mascotWelcome}
            style={styles.mascot}
          />

          <View
            className="absolute bottom-5 left-5 right-5 flex-row items-center rounded-[24px] bg-lingua-background px-5 py-4"
            style={styles.responseBubble}
          >
            <View className="min-w-0 flex-1 pr-4">
              <Text
                className="font-poppins-semibold text-[22px] leading-[30px] text-lingua-text"
                numberOfLines={1}
              >
                {language.beginnerGreeting}!
              </Text>
              <Text
                className="mt-1 font-poppins-medium text-[15px] leading-[21px] text-lingua-muted"
                numberOfLines={1}
              >
                {stageStatusLabel}
              </Text>
            </View>
            <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-lingua-soft-purple">
              <Ionicons
                color={colors.primary.deepPurple}
                name="volume-high"
                size={30}
              />
            </View>
          </View>
        </View>

        <View className="mt-8 px-9">
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
              textIcon="Aa"
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

            {errorMessage ? (
              <Text
                className="mt-4 font-poppins-medium text-[12px] leading-[18px] text-lingua-error"
                numberOfLines={1}
              >
                {errorMessage}
              </Text>
            ) : null}
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
    <View className="h-11 w-11 items-center justify-center rounded-full border border-lingua-audio-divider bg-lingua-background">
      <Ionicons
        color={colors.neutral.textPrimary}
        name={name}
        size={25}
      />
    </View>
  );
}

type ControlButtonProps = {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  muted?: boolean;
  loading?: boolean;
  onPress?: () => void;
  textIcon?: string;
  tone?: "default" | "danger";
};

function ControlButton({
  icon,
  label,
  loading = false,
  muted = false,
  onPress,
  textIcon,
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
        ) : textIcon ? (
          <Text className="font-poppins-bold text-[26px] leading-[34px] text-lingua-text">
            {textIcon}
          </Text>
        ) : (
          <Ionicons
            color={iconColor}
            name={icon ?? "ellipse"}
            size={34}
          />
        )}
        {muted ? <View className="absolute h-[3px] w-10 rotate-45 rounded-full bg-lingua-muted" /> : null}
      </View>
      <Text className="mt-3 text-center font-poppins-semibold text-[13px] leading-[18px] text-lingua-muted">
        {label}
      </Text>
    </Pressable>
  );
}

function getHeaderStatusLabel({
  callStatus,
  streamIsConnecting,
}: {
  callStatus: AudioCallStatus;
  streamIsConnecting: boolean;
}) {
  if (
    streamIsConnecting ||
    callStatus === "connecting" ||
    callStatus === "joining"
  ) {
    return "Connecting";
  }

  if (callStatus === "joined") {
    return "Online";
  }

  return "Ready";
}

function getStageStatusLabel(callStatus: AudioCallStatus) {
  if (callStatus === "connecting" || callStatus === "joining") {
    return "Connecting...";
  }

  if (callStatus === "joined") {
    return "Audio lesson in progress 🎧";
  }

  if (callStatus === "ended") {
    return "Lesson ended";
  }

  return "Tap Start to begin";
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
    alignSelf: "center",
    height: 380,
    marginTop: 32,
    position: "absolute",
    width: 380,
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
    paddingBottom: 34,
  },
  stage: {
    borderCurve: "continuous",
    height: 500,
  },
});
