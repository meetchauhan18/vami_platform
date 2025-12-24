import User from "../user/models/User.js";
import RefreshToken from "../auth/models/RefreshToken.js";

class SystemRepository {
  constructor(UserModel, RefreshTokenModel) {
    this.User = UserModel;
    this.RefreshToken = RefreshTokenModel;
  }

  async getUsers() {
    return await this.User.find()
      .select("email role isActive isEmailVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getSystemStats() {
    const [usersCount, activeSessionsCount] = await Promise.all([
      this.User.countDocuments(),
      this.RefreshToken.countDocuments({ revokedAt: null }),
    ]);
    return { usersCount, activeSessionsCount };
  }
}

export default new SystemRepository(User, RefreshToken);
