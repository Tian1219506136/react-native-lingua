import "../global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { colors, fonts } from "@/theme/tokens";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const posthogHost = "https://us.i.posthog.com";

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.");
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.family.regular]: fonts.assets.regular,
    [fonts.family.medium]: fonts.assets.medium,
    [fonts.family.semiBold]: fonts.assets.semiBold,
    [fonts.family.bold]: fonts.assets.bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        apiKey={posthogApiKey}
        options={{ disabled: !posthogApiKey, host: posthogHost }}
      >
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.neutral.background },
            headerShown: false,
          }}
        />
      </PostHogProvider>
    </ClerkProvider>
  );
}
