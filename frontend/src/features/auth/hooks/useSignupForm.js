import { useState } from "react";
import { RegisterRequestSchema } from "../auth.schema";
import { useRegister } from "../auth.mutations";

export function useSignupForm() {
  const registerMutation = useRegister();
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    const result = RegisterRequestSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    registerMutation.mutate(result.data);
  };

  return {
    handleSubmit,
    errors,
    loading: registerMutation.isPending,
  };
}
