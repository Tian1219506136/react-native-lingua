import { AuthScreen } from "@/components/AuthScreen";

export default function SignUpScreen() {
  return (
    <AuthScreen
      footerHref="/sign-in"
      footerLinkText="Log in"
      footerText="Already have an account?"
      primaryLabel="Sign Up"
      showPassword
      subtitle="Start your language journey today ✨"
      title="Create your account"
    />
  );
}
