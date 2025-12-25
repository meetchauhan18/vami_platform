import User from "./models/User.js";

class UserRepository {
  constructor(UserModel) {
    this.User = UserModel;
  }

  // ========== GENERIC CRUD OPERATIONS ==========

  async create(userData) {
    return this.User.create(userData);
  }

  async findById(id, selectFields = "") {
    return this.User.findById(id).select(selectFields || "+passwordChangedAt");
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

  async findByUsername(username) {
    return this.User.findOne({ username: username.toLowerCase() });
  }

  async update(userId, updateData, options = { new: true }) {
    return this.User.findByIdAndUpdate(userId, updateData, options);
  }

  async delete(userId) {
    return this.User.findByIdAndDelete(userId);
  }

  // ========== AUTH-SPECIFIC QUERIES ==========

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

  async findByEmailVerificationToken(hashedToken) {
    return this.User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");
  }

  // ========== DOCUMENT SAVE (for token generation) ==========

  async save(user) {
    return user.save({ validateBeforeSave: false });
  }
}

export default new UserRepository(User);
