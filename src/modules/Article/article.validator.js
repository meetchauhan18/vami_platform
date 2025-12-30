import Joi from "joi";

// MongoDB ObjectId pattern
const objectIdPattern = /^[a-f\d]{24}$/i;

// Slug pattern (lowercase alphanumeric with hyphens)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ========== REQUEST BODY SCHEMAS ==========

/**
 * Schema for creating a new article
 */
export const createArticleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 200 characters",
  }),
  subtitle: Joi.string().trim().max(300).optional().allow(""),
  content: Joi.array()
    .items(
      Joi.object({
        blockId: Joi.string().required(),
        type: Joi.string()
          .valid(
            "paragraph",
            "heading",
            "code",
            "image",
            "quote",
            "list",
            "callout",
            "divider",
            "embed"
          )
          .required(),
        data: Joi.any().optional(),
        order: Joi.number().integer().optional(),
      })
    )
    .optional()
    .default([]),
  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(30))
    .max(10)
    .optional()
    .default([]),
  coverImage: Joi.object({
    url: Joi.string().uri().optional(),
    alt: Joi.string().max(200).optional(),
  }).optional(),
}).strict();

/**
 * Schema for updating an article (all fields optional)
 */
export const updateArticleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().messages({
    "string.empty": "Title cannot be empty",
    "string.max": "Title must not exceed 200 characters",
  }),
  subtitle: Joi.string().trim().max(300).optional().allow(""),
  content: Joi.array()
    .items(
      Joi.object({
        blockId: Joi.string().required(),
        type: Joi.string()
          .valid(
            "paragraph",
            "heading",
            "code",
            "image",
            "quote",
            "list",
            "callout",
            "divider",
            "embed"
          )
          .required(),
        data: Joi.any().optional(),
        order: Joi.number().integer().optional(),
      })
    )
    .optional(),
  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(30))
    .max(10)
    .optional(),
  coverImage: Joi.object({
    url: Joi.string().uri().optional(),
    alt: Joi.string().max(200).optional(),
  }).optional(),
})
  .min(1) // At least one field must be provided
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// ========== PARAM SCHEMAS ==========

/**
 * Schema for validating article ID param
 */
export const articleIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid article ID format",
  }),
});

/**
 * Schema for validating slug param
 */
export const slugParamSchema = Joi.object({
  slug: Joi.string().pattern(slugPattern).required().messages({
    "string.pattern.base": "Invalid slug format",
  }),
});

/**
 * Schema for validating username param
 */
export const usernameParamSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.min": "Invalid username",
    "string.max": "Invalid username",
  }),
});

/**
 * Schema for validating tag param
 */
export const tagParamSchema = Joi.object({
  tag: Joi.string().trim().lowercase().max(30).required().messages({
    "string.max": "Invalid tag",
  }),
});

// ========== QUERY SCHEMAS ==========

/**
 * Schema for pagination and sorting query params
 */
export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "publishedAt", "stats.views")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  status: Joi.string()
    .valid("draft", "published", "archived", "unlisted")
    .optional(),
  tag: Joi.string().trim().lowercase().max(30).optional(),
});

// Default export for backward compatibility
export default {
  createArticleSchema,
  updateArticleSchema,
  articleIdParamSchema,
  slugParamSchema,
  usernameParamSchema,
  tagParamSchema,
  paginationQuerySchema,
};
