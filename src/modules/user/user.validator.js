import Joi from "joi";

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(50).trim(),
  bio: Joi.string().max(300).trim().allow(""),
  location: Joi.string().max(100).trim().allow(""),
  website: Joi.string().uri().allow(""),
  socialLinks: Joi.array()
    .items(
      Joi.object({
        platform: Joi.string()
          .valid("twitter", "github", "linkedin", "instagram", "youtube")
          .required(),
        url: Joi.string().uri().required(),
      })
    )
    .max(5),
  preferences: Joi.object({
    theme: Joi.string().valid("light", "dark", "system"),
    emailDigest: Joi.string().valid("daily", "weekly", "never"),
    language: Joi.string().length(2),
  }),
}).min(1); // At least one field required

/**
 * Schema for username parameter
 */
export const usernameParamSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]{3,20}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Username must contain only letters, numbers, and underscores (3-20 chars)",
    }),
});
