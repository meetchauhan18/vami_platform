import userRepository from "../../modules/user/user.repository.js";
import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { asyncHandler } from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header first (API clients / Postman)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // Fallback to cookies (Browser clients)
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(AppError.unAuthorized("Access token is required."));
  }

  const decodedToken = verifyAccessToken(token);

  if (!decodedToken) {
    return next(AppError.unAuthorized("Invalid access token."));
  }

  const user = await userRepository.findById(decodedToken?.id);

  if (!user) {
    return next(AppError.unAuthorized("This user no longer exists."));
  }

  // Check if password was changed after token was issued
  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(
      user.passwordChangedAt.getTime() / 1000
    );
    if (decodedToken.iat < passwordChangedTimestamp) {
      return next(
        AppError.unAuthorized("Password changed. Please log in again.")
      );
    }
  }

  req.user = {
    _id: user._id,
    role: user.role,
  };

  next();
});

export default authenticate;
