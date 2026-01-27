// core/validations/validator.js
import { normalizeError } from "@/shared/utils/normalizeError.js";

export function validateSchema(schema, payload, options = {}) {
  const { allowUnknown = true } = options;

  const effectiveSchema =
    !allowUnknown && schema._def?.typeName === "ZodObject"
      ? schema.strict()
      : schema;

  return effectiveSchema.safeParse(payload);
}

/**
 * Validate request payload
 */
export function validateRequest(schema, payload) {
  if (!schema) return payload;

  const result = validateSchema(schema, payload, {
    allowUnknown: false,
  });

  if (result.success) return result.data;

  throw normalizeError({
    status: 400,
    message: "Invalid request payload",
    code: "REQUEST_VALIDATION_ERROR",
    details: {
      fields: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        type: issue.code,
        message: issue.message,
      })),
    },
  });
}

/**
 * Validate response payload
 */
export function validateResponse(schema, payload) {
  if (!schema) return payload;

  const result = validateSchema(schema, payload, {
    allowUnknown: true,
  });

  if (result.success) return result.data;

  throw normalizeError({
    status: 500,
    message: "Invalid response from server",
    code: "RESPONSE_VALIDATION_ERROR",
    details: {
      fields: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        type: issue.code,
        message: issue.message,
      })),
    },
  });
}
