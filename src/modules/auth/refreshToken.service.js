// libs imports
import crypto from "crypto";

// local imports
import refreshTokenRepository from "./refresh-token.repository.js";
import AppError from "../../shared/utils/AppError.js";
import { generateAccessToken } from "../../shared/utils/jwt.utils.js";

class RefreshTokenService {
  constructor(RefreshTokenRepository) {
    this.RefreshTokenRepository = RefreshTokenRepository;
  }

  _calculateExpiryDate(rememberMe = false) {
    const days = rememberMe ? 30 : 7;
    return Date.now() + days * 24 * 60 * 60 * 1000;
  }

  async revokeRefreshToken(oldRefreshToken, createdByIp) {
    return this.RefreshTokenRepository.revokeToken(
      oldRefreshToken,
      createdByIp
    );
  }

  async revokeAndRotate(oldRefreshToken, createdByIp, replacedByToken) {
    return this.RefreshTokenRepository.revokeAndRotate(
      oldRefreshToken,
      createdByIp,
      replacedByToken
    );
  }

  async refreshToken(oldRefreshToken, createdByIp, userAgent) {
    // Step 1: Look up refresh token record with populated user
    const tokenDoc =
      await this.RefreshTokenRepository.findRefreshToken(oldRefreshToken);

    // Step 2: Validate token exists and is active
    if (!tokenDoc || !tokenDoc.isActive) {
      throw AppError.unAuthorized("Invalid refresh token");
    }

    // Step 3: Get user from populated field
    const user = tokenDoc.userId; // populated user document
    if (!user) {
      throw AppError.unAuthorized("User not found for this token");
    }

    // Step 4: Generate new refresh token (same as login)
    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    // Step 5: Rotation - revoke old token and mark as rotated
    await this.RefreshTokenRepository.revokeAndRotate(
      oldRefreshToken,
      createdByIp,
      newRefreshToken
    );

    // Step 6: Create new refresh token document
    const newRefreshTokenDoc =
      await this.RefreshTokenRepository.createRefreshToken({
        userId: user?._id,
        token: newRefreshToken,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdByIp,
        userAgent,
      });

    // Step 7: Generate new access token (JWT)
    const accessToken = generateAccessToken(user);

    // Return both tokens
    return { accessToken, refreshToken: newRefreshTokenDoc.token };
  }
}

export default new RefreshTokenService(refreshTokenRepository);
