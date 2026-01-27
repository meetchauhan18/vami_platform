import { SignupForm } from "../../../shared/components/ui/organisms/SignupForm/SignupForm";
import { useSignupForm } from "../hooks/useSignupForm";

export function SignupPage() {
  const { handleSubmit, errors, loading } = useSignupForm();

  return (
    <SignupForm onSubmit={handleSubmit} errors={errors} loading={loading} />
  );
}
