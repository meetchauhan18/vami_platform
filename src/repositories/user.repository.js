import User from "../models/User.js";

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
    return this.User.findById(id);
  }

  async updateLastLogin(userId) {
    return await this.User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }
}

export default new UserRepository(User);
