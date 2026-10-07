import LoginForm from "@/components/LoginForm";
import { googleEnabled } from "@/auth";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginForm googleEnabled={googleEnabled} />;
}
