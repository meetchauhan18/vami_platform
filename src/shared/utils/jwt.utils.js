import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user?._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (user, ip, token, userAgent) => {
  return jwt.sign(
    {
      token: token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      userId: user?._id,
      createdByIp: ip,
      userAgent: userAgent,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return null;
    }
    return decoded;
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return null;
    }
    return decoded;
  });
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
