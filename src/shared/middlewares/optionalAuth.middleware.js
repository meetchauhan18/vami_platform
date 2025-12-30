import userRepository from "../../modules/user/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

/**
 * Optional authentication middleware
 * Populates req.user if valid token is present, but allows unauthenticated requests
 * Use for routes that behave differently for authenticated vs anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
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

    // If no token, continue as anonymous user
    if (!token) {
      req.user = null;
      return next();
    }

    const decodedToken = verifyAccessToken(token);

    // If token is invalid, continue as anonymous user
    if (!decodedToken) {
      req.user = null;
      return next();
    }

    const user = await userRepository.findById(decodedToken?.id);

    // If user doesn't exist, continue as anonymous user
    if (!user) {
      req.user = null;
      return next();
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );
      if (decodedToken.iat < passwordChangedTimestamp) {
        req.user = null;
        return next();
      }
    }

    // Set user context (minimal info for article operations)
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: {
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
      },
    };

    next();
  } catch (error) {
    // On any error, continue as anonymous user
    req.user = null;
    next();
  }
};

export default optionalAuth;
