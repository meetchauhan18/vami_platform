import RefreshToken from "./models/RefreshToken.js";

class RefreshTokenRepository {
  constructor(RefreshToken) {
    this.model = RefreshToken;
  }

  async createRefreshToken(requiredTokenData) {
    return this.model.create(requiredTokenData);
  }

  async findRefreshToken(refreshToken) {
    return this.model.findOne({ token: refreshToken }).populate("userId");
  }

  async deleteRefreshToken(refreshToken) {
    return this.model.deleteOne({ token: refreshToken });
  }

  async revokeToken(currentRefreshToken, revokedByIp) {
    return this.model.findOneAndUpdate(
      { token: currentRefreshToken },
      {
        revokedAt: new Date(),
        revokedByIp,
      },
      { new: true }
    );
  }

  async revokeAllTokenForUser(userId, revokedByIp) {
    return this.model.updateMany(
      { userId },
      {
        revokedAt: new Date(),
        revokedByIp,
      }
    );
  }

  async revokeAndRotate(currentRefreshToken, revokedByIp, replacedByToken) {
    return this.model.findOneAndUpdate(
      { token: currentRefreshToken },
      {
        revokedAt: new Date(),
        revokedByIp,
        replacedByToken,
        isRotated: true,
      },
      { new: true }
    );
  }
}

export default new RefreshTokenRepository(RefreshToken);
