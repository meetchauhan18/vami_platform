import AppError from "../utils/AppError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return next(AppError.validationError(error));
    }

    // Assign sanitized value to req.body (includes Joi transformations like trim, lowercase)
    req.body = value;
    next();
  };
};

export default validate;
