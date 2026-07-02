import { images } from "@/constants/images";
import { colors } from "@/theme/tokens";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <StatusBar style="dark" />
      <View className="flex-1 px-10 pb-12 pt-7">
        <View className="items-center">
          <View className="flex-row items-center gap-3">
            <Image
              source={images.mascotLogo}
              className="h-[58px] w-[58px]"
              resizeMode="contain"
            />
            <Text className="font-poppins-bold text-[42px] leading-[52px] text-lingua-text">
              lingua
            </Text>
          </View>
        </View>

        <View className="mt-[70px]">
          <Text className="font-poppins-bold text-[43px] leading-[55px] text-lingua-text">
            Your AI language
          </Text>
          <Text className="font-poppins-bold text-[43px] leading-[55px] text-lingua-deep-purple">
            teacher.
          </Text>
          <Text className="mt-6 max-w-[330px] font-poppins text-[20px] leading-[31px] text-lingua-muted">
            Real conversations, personalized lessons, anytime, anywhere.
          </Text>
        </View>

        <View className="relative mt-5 flex-1 items-center justify-center">
          <View className="absolute left-0 top-9 rounded-[18px] bg-lingua-bubble-blue px-6 py-4">
            <Text className="font-poppins-medium text-[25px] leading-[31px] text-lingua-text">
              Hello!
            </Text>
            <View className="absolute bottom-[-10px] right-8 h-0 w-0 border-l-[14px] border-r-[4px] border-t-[14px] border-l-transparent border-r-transparent border-t-lingua-bubble-blue" />
          </View>

          <View className="absolute right-4 top-0 rounded-[18px] bg-lingua-bubble-purple px-6 py-4">
            <Text className="font-poppins-medium text-[25px] italic leading-[31px] text-lingua-deep-purple">
              ¡Hola!
            </Text>
            <View className="absolute bottom-[-10px] left-8 h-0 w-0 border-l-[4px] border-r-[14px] border-t-[14px] border-l-transparent border-r-transparent border-t-lingua-bubble-purple" />
          </View>

          <View className="absolute right-0 top-[122px] rounded-[18px] bg-lingua-bubble-peach px-6 py-4">
            <Text className="font-poppins-medium text-[25px] leading-[31px] text-lingua-accent-red">
              你好!
            </Text>
            <View className="absolute bottom-[-10px] left-8 h-0 w-0 border-l-[4px] border-r-[14px] border-t-[14px] border-l-transparent border-r-transparent border-t-lingua-bubble-peach" />
          </View>

          <Image
            source={images.mascotWelcome}
            className="mt-20 h-[430px] w-[430px]"
            resizeMode="contain"
          />
        </View>

        <View className="mb-8 flex-row items-center justify-center gap-[10px]">
          <View className="h-[9px] w-[9px] rounded-full bg-lingua-deep-purple" />
          <View className="h-[9px] w-[9px] rounded-full bg-lingua-border" />
          <View className="h-[9px] w-[9px] rounded-full bg-lingua-border" />
          <View className="h-[9px] w-[9px] rounded-full bg-lingua-border" />
        </View>

        <Link href="/" asChild>
          <Pressable className="h-[86px] flex-row items-center justify-center rounded-[22px] bg-lingua-deep-purple active:bg-lingua-purple">
            <Text className="font-poppins-semibold text-[22px] leading-[29px] text-white">
              Get Started
            </Text>
            <Text className="absolute right-9 font-poppins text-[48px] leading-[58px] text-white">
              ›
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
