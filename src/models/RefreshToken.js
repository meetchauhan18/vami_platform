import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdByIp: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  revokedAt: {
    type: Date,
  },
  revokedByIp: {
    type: String,
  },
  replacedByToken: {
    type: String,
  },
  isRotated: {
    type: Boolean,
    default: false,
  },
});

// Virtual: isExpired - checks if token has passed its expiration date
refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual: isActive - token is active if not revoked and not expired
refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && !this.isExpired;
});

// Ensure virtuals are included when converting to JSON/Object
refreshTokenSchema.set("toJSON", { virtuals: true });
refreshTokenSchema.set("toObject", { virtuals: true });

refreshTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
