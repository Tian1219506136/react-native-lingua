import { images } from "@/constants/images";
import { colors, fonts } from "@/theme/tokens";
import { AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  footerHref: "/sign-in" | "/sign-up";
  footerLinkText: string;
  footerText: string;
  primaryLabel: string;
  showPassword?: boolean;
  subtitle: string;
  title: string;
};

const socialProviders = [
  { color: colors.primary.blue, icon: "google", label: "Google" },
  { color: colors.primary.blue, icon: "facebook", label: "Facebook" },
  { color: colors.neutral.textPrimary, icon: "apple", label: "Apple" },
] as const;

function withAlpha(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function AuthScreen({
  footerHref,
  footerLinkText,
  footerText,
  primaryLabel,
  showPassword,
  subtitle,
  title,
}: AuthScreenProps) {
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View className="flex-1 px-[31px] pb-9 pt-4">
        <Pressable
          accessibilityLabel="Go back"
          className="h-12 w-12 items-start justify-center"
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={34} color={colors.neutral.textPrimary} />
        </Pressable>

        <View className="mt-5">
          <Text className="font-poppins-bold text-[28px] leading-[36px] text-lingua-text">
            {title}
          </Text>
          <Text className="mt-4 font-poppins text-[17px] leading-[25px] text-lingua-muted">
            {subtitle}
          </Text>
        </View>

        <View className="relative mt-2 h-[154px] items-center overflow-hidden">
          <Text className="absolute left-[72px] top-[48px] z-10 text-[24px] leading-[28px] text-lingua-streak">
            ✦
          </Text>
          <Text className="absolute right-[86px] top-[55px] z-10 text-[25px] leading-[29px] text-lingua-blue">
            ✦
          </Text>
          <Text className="absolute right-[104px] top-[94px] z-10 text-[25px] leading-[29px] text-lingua-warning">
            ✦
          </Text>
          <Image
            source={images.mascotAuth}
            className="absolute top-3 h-[210px] w-[230px]"
            resizeMode="contain"
          />
        </View>

        <View className="gap-4">
          <LabeledInput
            autoCapitalize="none"
            defaultValue="alex@gmail.com"
            keyboardType="email-address"
            label="Email"
          />
          {showPassword ? (
            <LabeledInput
              defaultValue="•••••••••"
              label="Password"
              rightAccessory={<Feather name="eye" size={25} color={colors.neutral.textSecondary} />}
              secureTextEntry
            />
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          className="mt-6 h-[62px] overflow-hidden rounded-[15px] shadow-sm"
          onPress={() => setIsVerificationVisible(true)}
        >
          <LinearGradient
            colors={[colors.primary.purple, colors.primary.deepPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text className="font-poppins-semibold text-[20px] leading-[28px] text-white">
              {primaryLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View className="mt-[34px] flex-row items-center gap-5">
          <View className="h-px flex-1 bg-lingua-border" />
          <Text className="font-poppins text-[16px] leading-[23px] text-lingua-muted">
            or continue with
          </Text>
          <View className="h-px flex-1 bg-lingua-border" />
        </View>

        <View className="mt-6 gap-3">
          {socialProviders.map((provider) => (
            <TouchableOpacity
              activeOpacity={0.75}
              className="h-[57px] flex-row items-center justify-center rounded-[15px] border border-lingua-border bg-lingua-background"
              key={provider.label}
              onPress={() => setIsVerificationVisible(true)}
            >
              <AntDesign
                color={provider.color}
                name={provider.icon}
                size={30}
                style={styles.socialIcon}
              />
              <Text className="font-poppins-medium text-[16px] leading-[23px] text-lingua-text">
                Continue with {provider.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-auto flex-row justify-center pt-8">
          <Text className="font-poppins text-[16px] leading-[24px] text-lingua-muted">
            {footerText}{" "}
          </Text>
          <Link
            className="font-poppins-semibold text-[16px] leading-[24px] text-lingua-deep-purple"
            href={footerHref}
          >
            {footerLinkText}
          </Link>
        </View>
      </View>

      <VerificationModal
        isVisible={isVerificationVisible}
        onClose={() => setIsVerificationVisible(false)}
      />
    </SafeAreaView>
  );
}

function LabeledInput({
  label,
  rightAccessory,
  ...inputProps
}: {
  label: string;
  rightAccessory?: ReactNode;
} & ComponentProps<typeof TextInput>) {
  return (
    <View className="h-[85px] justify-center rounded-[15px] border border-lingua-border bg-lingua-background px-[18px]">
      <Text className="font-poppins-medium text-[14px] leading-[20px] text-lingua-muted">
        {label}
      </Text>
      <View className="mt-2 flex-row items-center">
        <TextInput
          {...inputProps}
          placeholderTextColor={colors.neutral.textSecondary}
          style={styles.input}
        />
        {rightAccessory ? <View className="ml-3">{rightAccessory}</View> : null}
      </View>
    </View>
  );
}

function VerificationModal({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isVisible) {
      setCode("");
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
  }, [isVisible]);

  function handleCodeChange(value: string) {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6) {
      onClose();
      router.replace("/");
    }
  }

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboardView}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          <Text className="font-poppins-bold text-[24px] leading-[31px] text-lingua-text">
            Check your email
          </Text>
          <Text className="mt-3 font-poppins text-[15px] leading-[23px] text-lingua-muted">
            We sent you a verification email. Enter the 6-digit code to continue.
          </Text>

          <Pressable className="mt-7 flex-row justify-between" onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                className="h-[50px] w-[43px] items-center justify-center rounded-[13px] border border-lingua-border bg-lingua-background"
                key={index}
              >
                <Text className="font-poppins-semibold text-[20px] leading-[27px] text-lingua-text">
                  {code[index] ?? ""}
                </Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            autoFocus
            caretHidden
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={handleCodeChange}
            textContentType="oneTimeCode"
            value={code}
            style={styles.hiddenCodeInput}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hiddenCodeInput: {
    height: 1,
    opacity: 0,
    position: "absolute",
    width: 1,
  },
  input: {
    color: colors.neutral.textPrimary,
    flex: 1,
    fontFamily: fonts.family.medium,
    fontSize: 17,
    lineHeight: 24,
    padding: 0,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(colors.neutral.textPrimary, 0.28),
  },
  modalCard: {
    backgroundColor: colors.neutral.background,
    borderColor: colors.neutral.border,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 24,
    marginBottom: 22,
    padding: 24,
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  primaryButtonGradient: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  safeArea: {
    backgroundColor: colors.neutral.background,
    flex: 1,
  },
  socialIcon: {
    left: 54,
    position: "absolute",
  },
});
