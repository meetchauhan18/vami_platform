import { useLogin } from "../auth.mutations";
import { LoginRequestSchema } from "../auth.schema";
import { useState } from "react";

export function useLoginForm() {
  const loginMutation = useLogin();
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    console.log("🚀 ~ handleSubmit ~ formData:", formData)
    const values = Object.fromEntries(formData.entries());
    console.log("🚀 ~ handleSubmit ~ values:", values)

    const result = LoginRequestSchema.safeParse(values);
    console.log("🚀 ~ handleSubmit ~ result:", result)

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // ✅ Client validation passed → call server
    loginMutation.mutate(result.data);
  };

  return {
    handleSubmit,
    errors,
    loading: loginMutation.isPending,
  };
}
