import { AuthForm } from "@/shared/components/ui/organisms/AuthForm";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginPage() {
  const { handleSubmit, errors, loading } = useLoginForm();
  console.log("🚀 ~ LoginPage ~ errors:", errors)

  return <AuthForm onSubmit={handleSubmit} errors={errors} loading={loading} />;
}
