import User from "./models/User.js";

class UserRepository {
  constructor(UserModel) {
    this.User = UserModel;
  }

  async create(userData) {
    return this.User.create(userData);
  }

  async findByIdentifier(identifier, selectPassword = false) {
    const query = this.User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (selectPassword) {
      query.select("+password");
    }

    return query;
  }

  async findById(id) {
    return this.User.findById(id).select("+passwordChangedAt");
  }

  async updateLastLogin(userId) {
    return await this.User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async updatePassword(userId, newPassword) {
    return await this.User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: newPassword,
          passwordChangedAt: new Date(),
        },
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      },
      { new: true }
    );
  }

  async findByResetToken(hashedToken, selectPassword = false) {
    let query = this.User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (selectPassword) {
      query = query.select("+password");
    }

    return query;
  }

  async findByEmailVerificationToken(hashedToken, selectPassword = false) {
    let query = this.User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (selectPassword) {
      query = query.select("+password");
    }

    return query;
  }

  async updateEmailVerification(userId) {
    return await this.User.findByIdAndUpdate(
      userId,
      {
        $set: { isEmailVerified: true },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
        },
      },
      { new: true }
    );
  }

  async saveEmailVerificationToken(user) {
    return await user.save({ validateBeforeSave: false });
  }

  async savePasswordResetToken(user) {
    return await user.save({ validateBeforeSave: false });
  }
}

export default new UserRepository(User);
