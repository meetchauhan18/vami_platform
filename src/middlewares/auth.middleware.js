import userRepository from "../repositories/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("🚀 ~ authenticate ~ token:", token)
    const decodedToken = verifyAccessToken(token);
    console.log("🚀 ~ authenticate ~ decodedToken:", decodedToken)

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userRepository.findById(decodedToken?.id);
    console.log("🚀 ~ authenticate ~ user:", user)

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user?._id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
