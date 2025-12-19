import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { asyncHandler } from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unAuthorized("Access token is required."));
  }

  const token = req.headers.authorization.split(" ")[1];

  const decodedToken = verifyAccessToken(token);

  if (!decodedToken) {
    return next(AppError.unAuthorized("Invalid access token."));
  }

  const user = await userRepository?.findById(decodedToken?.id);

  if (!user) {
    return next(AppError.unAuthorized("This user no longer exists."));
  }

  req.user = {
    _id: user?._id,
    username: user?.username,
    email: user?.email,
    role: user?.role,
  };

  next();
});

export default authenticate;
