// libs
import { useState } from "react";
import clsx from "clsx";

// local
import { FormField } from "../FormField";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";

import {
  PASSWORD_TOGGLE,
  PASSWORD_WRAPPER,
  PASSWORD_INPUT,
  PASSWORD_TOGGLE_BUTTON,
} from "./passwordField.config";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * PasswordField – Molecule
 */
export function PasswordField({
  label,
  helperText,
  error,
  success,
  required = false,
  disabled = false,
  inputProps = {},
  className,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      success={success}
      required={required}
      disabled={disabled}
      className={className}
    >
      {(id) => (
        <div className={clsx(PASSWORD_WRAPPER)}>
          <Input
            {...inputProps}
            id={id} // ✅ label now focuses input
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={clsx(PASSWORD_INPUT)}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            startIcon={visible ? <FiEyeOff /> : <FiEye />}
            ariaLabel={
              visible ? PASSWORD_TOGGLE.hideLabel : PASSWORD_TOGGLE.showLabel
            }
            onClick={() => setVisible((v) => !v)}
            className={clsx(PASSWORD_TOGGLE_BUTTON)}
          / >
        </div>
      )}
    </FormField>
  );
}
