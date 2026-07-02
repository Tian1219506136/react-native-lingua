import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants/images";
import { supportedLanguages } from "@/data/languages";
import { useLanguageStore } from "@/store/languageStore";
import { colors } from "@/theme/tokens";
import type { LanguageCode } from "@/types/learning";
import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageSelectionScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const persistedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );
  const hasHydratedLanguage = useLanguageStore((state) => state.hasHydrated);
  const setPersistedLanguageCode = useLanguageStore(
    (state) => state.setSelectedLanguageCode,
  );
  const posthog = usePostHog();
  const [selectedLanguageCode, setSelectedLanguageCode] =
    useState<LanguageCode>(persistedLanguageCode ?? "es");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (persistedLanguageCode) {
      setSelectedLanguageCode(persistedLanguageCode);
    }
  }, [persistedLanguageCode]);

  const handleSeeAllLanguagesPress = () => {
    // TODO: wire full language catalog when that chapter exists.
  };

  const visibleLanguages = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return supportedLanguages;
    }

    return supportedLanguages.filter((language) =>
      [language.name, language.nativeName, language.beginnerGreeting].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [searchText]);

  if (!isLoaded || !hasHydratedLanguage) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <ScrollView
        className="flex-1 ds-screen"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 18,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          <View className="h-10 flex-row items-center justify-center">
            <Pressable
              accessibilityLabel="Go back"
              className="absolute left-0 h-10 w-10 items-start justify-center"
              onPress={() => router.back()}
            >
              <Ionicons
                color={colors.neutral.textPrimary}
                name="chevron-back"
                size={30}
              />
            </Pressable>

            <Text className="font-poppins-semibold text-[24px] leading-[31px] text-lingua-text">
              Choose a language
            </Text>
          </View>

          <View className="mt-8 h-[68px] flex-row items-center gap-4 rounded-[32px] border border-lingua-border bg-lingua-surface px-6">
            <Ionicons
              color={colors.neutral.textSecondary}
              name="search-outline"
              size={28}
            />
            <TextInput
              className="min-w-0 flex-1 font-poppins text-[20px] leading-[26px] text-lingua-text"
              onChangeText={setSearchText}
              placeholder="Search languages"
              placeholderTextColor={colors.neutral.textSecondary}
              returnKeyType="search"
              value={searchText}
            />
          </View>

          <Text className="mt-9 font-poppins-semibold text-[22px] leading-[29px] text-lingua-text">
            Popular
          </Text>

          <View className="mt-6 gap-3">
            {visibleLanguages.map((language) => {
              const isSelected = language.code === selectedLanguageCode;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={
                    isSelected
                      ? "min-h-[112px] flex-row items-center rounded-[26px] border-2 border-lingua-purple bg-lingua-bubble-purple px-5"
                      : "min-h-[112px] flex-row items-center rounded-[26px] border border-lingua-background bg-lingua-background px-5"
                  }
                  key={language.code}
                  onPress={() => setSelectedLanguageCode(language.code)}
                >
                  <View className="h-[54px] w-[54px] items-center justify-center rounded-full border border-lingua-border bg-lingua-background">
                    <Text className="text-[34px] leading-[42px]">
                      {language.flagEmoji}
                    </Text>
                  </View>

                  <View className="min-w-0 flex-1 pl-6">
                    <Text className="font-poppins-semibold text-[22px] leading-[29px] text-lingua-text">
                      {language.name}
                    </Text>
                    <Text className="mt-1 font-poppins text-[17px] leading-[24px] text-lingua-muted">
                      {language.learnersLabel}
                    </Text>
                  </View>

                  <View className="w-9 items-end">
                    {isSelected ? (
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-lingua-purple">
                        <Ionicons
                          color={colors.neutral.background}
                          name="checkmark"
                          size={26}
                        />
                      </View>
                    ) : (
                      <Ionicons
                        color={colors.neutral.textSecondary}
                        name="chevron-forward"
                        size={26}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-7 h-[78px] flex-row items-center rounded-[28px] border border-lingua-border bg-lingua-background px-5 active:bg-lingua-surface"
            onPress={handleSeeAllLanguagesPress}
          >
            <View className="h-[54px] w-[54px] items-center justify-center rounded-full">
              <Ionicons
                color={colors.neutral.textSecondary}
                name="globe-outline"
                size={32}
              />
            </View>
            <Text className="pl-6 font-poppins-semibold text-[20px] leading-[28px] text-lingua-text">
              See all languages
            </Text>
          </Pressable>

          <Pressable
            className="mt-7 h-[78px] flex-row items-center justify-center rounded-[28px] bg-lingua-purple active:bg-lingua-deep-purple"
            onPress={() => {
              setPersistedLanguageCode(selectedLanguageCode);
              posthog.capture("language_selected", {
                language_code: selectedLanguageCode,
              });
              router.replace("/");
            }}
          >
            <Text className="font-poppins-semibold text-[20px] leading-[28px] text-lingua-background">
              Continue
            </Text>
          </Pressable>

          <View className="mt-auto pt-8">
            <Image
              contentFit="cover"
              source={images.earth}
              style={{
                alignSelf: "center",
                height: 190,
                marginBottom: -36,
                width: 430,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
