import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyLessonRoute() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  return (
    <Redirect
      href={{
        pathname: "/(tabs)/lesson/[lessonId]",
        params: { lessonId },
      }}
    />
  );
}
