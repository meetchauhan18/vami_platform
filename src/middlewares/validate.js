import AppError from "../utils/AppError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return next(AppError.validationError(error));
    }

    next();
  };
};

export default validate;
