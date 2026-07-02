import { useAuth } from "@clerk/expo";
import { useLanguageStore } from "@/store/languageStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydratedLanguage = useLanguageStore((state) => state.hasHydrated);
  const selectedLanguageCode = useLanguageStore(
    (state) => state.selectedLanguageCode,
  );

  if (!isLoaded || !hasHydratedLanguage) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-selection" />;
  }

  return <Redirect href="/home" />;
}
