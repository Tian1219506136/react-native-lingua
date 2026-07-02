import { AuthScreen } from "@/components/AuthScreen";

export default function SignInScreen() {
  return (
    <AuthScreen
      footerHref="/sign-up"
      footerLinkText="Sign up"
      footerText="Don't have an account?"
      primaryLabel="Sign In"
      showPassword
      subtitle="Welcome back to your language journey ✨"
      title="Welcome back"
    />
  );
}
