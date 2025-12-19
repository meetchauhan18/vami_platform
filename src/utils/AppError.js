class AppError extends Error {
  constructor(message, httpStatusCode, code) {
    super(message);
    this.code = code;
    this.httpStatusCode = httpStatusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      httpStatusCode: this.httpStatusCode,
      message: this.message,
    };
  }

  // Common Error Types
  static badRequest(message = "Bad Request") {
    return new AppError(message, 400, "BAD_REQUEST");
  }

  static unAuthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static notFoundError(message = "Not Found") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static validationError(error) {
    const message = error?.details?.map((detail) => detail.message).join(", ");
    return new AppError(message || "Validation Error", 422, "VALIDATION_ERROR");
  }

  static conflictError(message = "Conflict") {
    return new AppError(message, 409, "CONFLICT");
  }

  static internalServerError(message = "Internal Server Error") {
    return new AppError(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

export default AppError;
