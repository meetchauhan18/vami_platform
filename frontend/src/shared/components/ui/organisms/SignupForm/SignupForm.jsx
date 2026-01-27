// libs
import clsx from "clsx";

// local
import { FormField } from "../../molecules/FormField";
import { PasswordField } from "../../molecules/PasswordField";
import { Button } from "../../atoms/Button";

import {
  AUTH_FORM_WRAPPER,
  AUTH_FORM_HEADER,
} from "../AuthForm/authForm.config";

/**
 * SignupForm – Organism (no confirm password)
 */
export function SignupForm({
  title = "Create account",
  submitLabel = "Sign up",
  errors = {},
  onSubmit,
  loading = false,
  className,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx(AUTH_FORM_WRAPPER, className)}
      noValidate
    >
      <h1 className={clsx(AUTH_FORM_HEADER)}>{title}</h1>

      <FormField
        label="Username"
        required
        error={errors.username}
        inputProps={{
          name: "username",
          placeholder: "meet_chauhan",
        }}
      />

      <FormField
        label="Email"
        required
        error={errors.email}
        inputProps={{
          type: "email",
          name: "email",
          autoComplete: "email",
          placeholder: "you@example.com",
        }}
      />

      <PasswordField
        label="Password"
        required
        error={errors.password}
        inputProps={{
          name: "password",
          autoComplete: "new-password",
          placeholder: "••••••••",
        }}
      />

      <Button type="submit" fullWidth loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
