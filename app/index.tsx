import { useAuth } from "@clerk/expo";
import { images } from "@/constants/images";
import { colors } from "@/theme/tokens";
import { Redirect } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const primaryTokens = [
  ["LINGUA PURPLE", colors.primary.purple],
  ["LINGUA DEEP PURPLE", colors.primary.deepPurple],
  ["LINGUA BLUE", colors.primary.blue],
  ["LINGUA GREEN", colors.primary.green],
] as const;

const semanticTokens = [
  ["SUCCESS", colors.semantic.success],
  ["WARNING", colors.semantic.warning],
  ["STREAK", colors.semantic.streak],
  ["ERROR", colors.semantic.error],
  ["INFO", colors.semantic.info],
] as const;

const neutralTokens = [
  ["TEXT / PRIMARY", colors.neutral.textPrimary],
  ["TEXT / SECONDARY", colors.neutral.textSecondary],
  ["BORDER", colors.neutral.border],
  ["SURFACE", colors.neutral.surface],
  ["BACKGROUND", colors.neutral.background],
] as const;

const typeRows = [
  ["H1", "Page / Screen Title", "32px", "Bold", "1.2"],
  ["H2", "Section Title", "24px", "SemiBold", "1.3"],
  ["H3", "Card / Module Title", "20px", "SemiBold", "1.3"],
  ["H4", "Subheading", "16px", "Medium", "1.4"],
  ["Body Large", "Important content", "16px", "Regular", "1.6"],
  ["Body Medium", "Body text", "14px", "Regular", "1.6"],
  ["Body Small", "Supporting text", "13px", "Regular", "1.6"],
  ["Caption", "Labels, meta text", "11px", "Regular", "1.4"],
] as const;

export default function Index() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <ScrollView
      className="flex-1 ds-screen"
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* TEMP: QA-only sign-out; remove once real profile/settings screen exists */}
      <Pressable
        className="mb-5 self-start rounded-2xl border border-lingua-border bg-lingua-background px-5 py-3 active:bg-lingua-surface"
        onPress={() => void signOut()}
      >
        <Text className="font-poppins-semibold text-[16px] leading-[22px] text-lingua-error">
          Sign out (temp)
        </Text>
      </Pressable>

      <View className="gap-4 lg:flex-row">
        <View className="flex-1 gap-4">
          <View className="ds-panel px-6 py-7">
            <SectionHeader title="Brand" />
            <View className="mt-8 flex-row items-center justify-center gap-6">
              <Image
                source={images.mascotLogo}
                className="h-24 w-24"
                resizeMode="contain"
              />
              <Text className="font-poppins-bold text-[54px] leading-[65px] text-lingua-text">
                lingua
              </Text>
            </View>
          </View>

          <View className="ds-panel px-6 py-7">
            <SectionHeader title="Colors" />
            <TokenGroup title="Primary" tokens={primaryTokens} />
            <TokenGroup title="Semantic" tokens={semanticTokens} compact />
            <TokenGroup title="Neutrals" tokens={neutralTokens} compact />
          </View>
        </View>

        <View className="flex-1 ds-panel px-6 py-7">
          <SectionHeader title="Typography" />
          <Text className="ds-label mt-7">Font Family</Text>
          <Text className="mt-5 font-poppins-bold text-[56px] leading-[67px] text-lingua-text">
            Poppins
          </Text>
          <Text className="mt-4 max-w-[520px] font-poppins text-body-lg text-lingua-muted">
            Poppins is a modern, geometric sans-serif typeface that provides
            excellent readability and a friendly personality.
          </Text>

          <View className="mt-9 gap-8">
            {typeRows.map(([name, usage, size, weight, lineHeight]) => (
              <View key={name} className="flex-row items-center gap-5">
                <Text className={typeNameClassName(name)}>{name}</Text>
                <Text className="flex-1 font-poppins text-body-md text-lingua-muted">
                  {usage}
                </Text>
                <Text className="w-16 font-poppins text-body-md text-lingua-muted">
                  {size}
                </Text>
                <Text className="w-24 font-poppins text-body-md text-lingua-muted">
                  {weight}
                </Text>
                <Text className="w-9 font-poppins text-body-md text-lingua-muted">
                  {lineHeight}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-4">
      <Text className="ds-section-title">{title}</Text>
      <View className="h-px flex-1 bg-lingua-border" />
    </View>
  );
}

function TokenGroup({
  compact,
  title,
  tokens,
}: {
  compact?: boolean;
  title: string;
  tokens: readonly (readonly [string, string])[];
}) {
  return (
    <View className="mt-8">
      <Text className="ds-label">{title}</Text>
      <View className="mt-4 flex-row flex-wrap justify-between gap-y-6">
        {tokens.map(([name, value]) => (
          <View key={name} className={compact ? "w-[86px]" : "w-[112px]"}>
            <View
              className={compact ? "h-[82px] w-[82px]" : "h-[104px] w-[104px]"}
              style={{
                backgroundColor: value,
                borderColor: value === colors.neutral.background ? colors.neutral.border : value,
                borderRadius: 9,
                borderWidth: value === colors.neutral.background ? 1 : 0,
              }}
            />
            <Text className="ds-token-name mt-3">{name}</Text>
            <Text className="ds-token-value">{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function typeNameClassName(name: string) {
  switch (name) {
    case "H1":
      return "w-36 font-poppins-bold text-h1 text-lingua-text";
    case "H2":
      return "w-36 font-poppins-semibold text-h2 text-lingua-text";
    case "H3":
      return "w-36 font-poppins-semibold text-h3 text-lingua-text";
    case "H4":
      return "w-36 font-poppins-medium text-h4 text-lingua-text";
    default:
      return "w-36 font-poppins text-body-md text-lingua-text";
  }
}
