import { colors } from "@/theme/tokens";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TabPlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <View className="flex-1 items-center justify-center px-8 pb-28">
        <Text className="text-center font-poppins-bold text-[28px] leading-[36px] text-lingua-text">
          {title}
        </Text>
        <Text className="mt-3 text-center font-poppins text-[16px] leading-[25px] text-lingua-muted">
          Placeholder screen
        </Text>
      </View>
    </SafeAreaView>
  );
}
