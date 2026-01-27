// libs import
import clsx from "clsx";

// local import
import { FormField } from "../../molecules/FormField";
import { PasswordField } from "../../molecules/PasswordField";
import { Button } from "../../atoms/Button";
import {
  AUTH_FORM_WRAPPER,
  AUTH_FORM_HEADER,
  AUTH_FORM_ERROR,
} from "./authForm.config";

/**
 * AuthForm – Organism
 * UI-only login form
 */
export function AuthForm({
  title = "Sign in",
  submitLabel = "Sign in",
  error,

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

      {error && (
        <div role="alert" className={clsx(AUTH_FORM_ERROR)}>
          {error}
        </div>
      )}

      <FormField
        label="Email"
        required
        inputProps={{
          type: "text",
          name: "identifier",
          autoComplete: "username",
          placeholder: "Enter username or email",
        }}
      />

      <PasswordField
        label="Password"
        required
        inputProps={{
          name: "password",
          autoComplete: "current-password",
          placeholder: "••••••••",
        }}
      />

      <Button type="submit" fullWidth loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
