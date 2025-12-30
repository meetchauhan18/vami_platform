import AppError from "../utils/AppError.js";

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Request property to validate: 'body', 'params', or 'query'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: source === "query", // Only strip unknown for query params
    });

    if (error) {
      return next(AppError.validationError(error));
    }

    // Assign sanitized value back (includes Joi transformations like trim, lowercase)
    req[source] = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema) => validate(schema, "body");

/**
 * Validate request params
 */
export const validateParams = (schema) => validate(schema, "params");

/**
 * Validate request query
 */
export const validateQuery = (schema) => validate(schema, "query");

// Default export for backward compatibility
export default validate;
