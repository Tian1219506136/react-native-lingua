import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/tokens";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_BAR_HEIGHT = 88;
const ACTIVE_CIRCLE_SIZE = 48;

const tabIcons: Record<string, IconName> = {
  home: "home",
  learn: "book-outline",
  "ai-teacher": "headset-outline",
  chat: "chatbubble-outline",
  profile: "person-outline",
};

export function CustomTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);
  const [barWidth, setBarWidth] = useState(0);
  const slotWidth = barWidth / state.routes.length;

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 18,
      mass: 0.75,
      stiffness: 170,
    });
  }, [activeIndex, state.index]);

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          activeIndex.value * slotWidth +
          slotWidth / 2 -
          ACTIVE_CIRCLE_SIZE / 2,
      },
    ],
  }));

  const activeRoute = state.routes[state.index];
  const activeIcon = tabIcons[activeRoute.name] ?? "ellipse-outline";

  return (
    <View
      className="bg-lingua-background px-5 pt-3"
      style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <View
        className="relative flex-row rounded-[30px] border border-lingua-border bg-lingua-background px-2"
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={styles.tabBar}
      >
        {barWidth > 0 ? (
          <Animated.View
            className="absolute top-[10px] items-center justify-center rounded-full bg-lingua-purple"
            pointerEvents="none"
            style={[
              styles.activeCircle,
              activeIndicatorStyle,
            ]}
          >
            <Ionicons
              color={colors.neutral.background}
              name={activeIcon}
              size={26}
            />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const label =
            typeof options.title === "string" ? options.title : route.name;
          const isFocused = state.index === index;
          const iconName = tabIcons[route.name] ?? "ellipse-outline";

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: "tabPress",
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              target: route.key,
              type: "tabLongPress",
            });
          };

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="h-full flex-1 items-center justify-end pb-[11px]"
              key={route.key}
              onLongPress={onLongPress}
              onPress={onPress}
            >
              {isFocused ? (
                <View className="h-[50px]" />
              ) : (
                <>
                  <Ionicons
                    color={colors.neutral.textSecondary}
                    name={iconName}
                    size={30}
                  />
                  <Text className="mt-1 text-center font-poppins-medium text-[12px] leading-[17px] text-lingua-muted">
                    {label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeCircle: {
    height: ACTIVE_CIRCLE_SIZE,
    width: ACTIVE_CIRCLE_SIZE,
  },
  safeArea: {
    boxShadow: "0 -8px 22px rgba(13, 19, 43, 0.08)",
  },
  tabBar: {
    borderCurve: "continuous",
    height: TAB_BAR_HEIGHT,
  },
});
