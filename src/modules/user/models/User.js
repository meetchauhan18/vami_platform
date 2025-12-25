import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]{3,20}$/,
        "Username must contain only letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    // email verification token and expiration
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // password reset token and expiration
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Profile sub-schema
    profile: {
      displayName: { type: String, maxlength: 50 },
      bio: { type: String, maxlength: 300 },
      avatar: {
        url: { type: String },
        key: { type: String }, // S3 key for deletion
      },
      coverImage: {
        url: { type: String },
        key: { type: String }, 
      },
      location: { type: String, maxlength: 100 },
      website: { type: String },
      socialLinks: [
        {
          platform: {
            type: String,
            enum: ["twitter", "github", "linkedin", "instagram", "youtube"],
          },
          url: { type: String },
        },
      ],
    },

    // Creator profile
    creatorProfile: {
      isCreator: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      expertise: [{ type: String }],
      featuredWork: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    },

    // User preferences
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      emailDigest: {
        type: String,
        enum: ["daily", "weekly", "never"],
        default: "weekly",
      },
      language: { type: String, default: "en" },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 });
userSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 });

// Instance method (called on user document)
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return unhashed token (to send via email)
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expiration (10 minutes)
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  // Return unhashed token (to send via email)
  return verificationToken;
};

const User = mongoose.model("User", userSchema);
export default User;
