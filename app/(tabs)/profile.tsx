import { useAuth } from "@clerk/expo";
import { useLanguageStore } from "@/store/languageStore";
import { colors } from "@/theme/tokens";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const clearSelectedLanguage = useLanguageStore(
    (state) => state.clearSelectedLanguage,
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <View className="flex-1 items-center justify-center px-8 pb-28">
        <Text className="text-center font-poppins-bold text-[28px] leading-[36px] text-lingua-text">
          Profile
        </Text>
        <Text className="mt-3 text-center font-poppins text-[16px] leading-[25px] text-lingua-muted">
          Placeholder screen
        </Text>

        {/* TEMP: QA-only controls; replace with real profile/settings actions */}
        <Pressable
          className="mt-10 rounded-2xl border border-lingua-border bg-lingua-background px-6 py-3 active:bg-lingua-surface"
          onPress={() => void signOut()}
        >
          <Text className="font-poppins-semibold text-[16px] leading-[22px] text-lingua-error">
            Sign out (temp)
          </Text>
        </Pressable>

        {/* TEMP: QA-only; lets us retest the language-selection gate */}
        <Pressable
          className="mt-4 rounded-2xl border border-lingua-border bg-lingua-background px-6 py-3 active:bg-lingua-surface"
          onPress={() => void clearSelectedLanguage()}
        >
          <Text className="font-poppins-semibold text-[16px] leading-[22px] text-lingua-muted">
            Clear language storage (temp)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
