import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LanguageCode } from "@/types/learning";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LanguageState = {
  hasHydrated: boolean;
  selectedLanguageCode: LanguageCode | null;
  clearSelectedLanguage: () => Promise<void>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSelectedLanguageCode: (languageCode: LanguageCode) => void;
};

const languageStorageKey = "lingua-language-selection";

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      selectedLanguageCode: null,
      clearSelectedLanguage: async () => {
        set({ selectedLanguageCode: null });
        await AsyncStorage.removeItem(languageStorageKey);
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSelectedLanguageCode: (languageCode) =>
        set({ selectedLanguageCode: languageCode }),
    }),
    {
      name: languageStorageKey,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        selectedLanguageCode: state.selectedLanguageCode,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
