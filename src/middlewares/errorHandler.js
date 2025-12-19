import AppError from "../utils/AppError.js";

const notFoundHandler = (req, res, next) => {
  next(AppError.notFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};

// Handle Mongoose Validation Error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle Mogoose Duplicate Key Error and JWT Errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue);
  const message = `Duplicate field value entered for ${field}`;
  return new AppError(message, 409);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

const handleCastError = (err) => {
  const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const normalizedErrors = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  if (err.name === "ValidationError") {
    return handleValidationError(err);
  }

  if (err.code && err.code === 11000) {
    return handleDuplicateKeyError(err);
  }

  if (err.name === "JsonWebTokenError") {
    return handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    return handleJWTExpiredError();
  }

  if (err.name === "CastError") {
    return handleCastError(err);
  }

  return AppError.internalServerError();
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.httpStatusCode || 500;

  const normalizedError = normalizedErrors(err) || err;

  const message =
    normalizedError && typeof normalizedError.toJSON === "function"
      ? normalizedError.toJSON()
      : {
          code: normalizedError?.code || "INTERNAL_SERVER_ERROR",
          httpStatusCode: normalizedError?.httpStatusCode || statusCode,
          message: normalizedError?.message || "Internal Server Error",
        };

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export {
  errorHandler,
  notFoundHandler,
  normalizedErrors,
  handleValidationError,
};
