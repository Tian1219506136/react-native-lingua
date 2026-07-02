import "../global.css";

import { colors, fonts } from "@/theme/tokens";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync();

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
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.neutral.background },
        headerShown: false,
      }}
    />
  );
}
