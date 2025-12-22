import AppError from "../utils/AppError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🚀 ~ authorize ~ req:", req)
    if (!req.user) {
      throw next(new AppError("Unauthorized", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw next(
        new AppError("You do not have permission to access this resource", 403)
      );
    }
    next();
  };
};
