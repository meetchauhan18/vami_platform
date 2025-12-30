// libs import
import express from "express";

// local imports
import authenticate from "../../shared/middlewares/auth.middleware.js";
import optionalAuth from "../../shared/middlewares/optionalAuth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validate.js";
import articleController from "./article.controller.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdParamSchema,
  slugParamSchema,
  tagParamSchema,
  paginationQuerySchema,
} from "./article.validator.js";

// initialize router
const router = express.Router();

// destructure controller methods
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  getArticlesByTag,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
} = articleController;

// ========== PUBLIC ROUTES (Optional Auth) ==========

// List published articles with pagination
// GET /api/v1/articles?page=1&limit=10&sortBy=publishedAt&tag=javascript
router.get(
  "/",
  optionalAuth,
  validateQuery(paginationQuerySchema),
  getArticles
);

// Get articles by tag
// GET /api/v1/articles/tag/:tag
router.get(
  "/tag/:tag",
  optionalAuth,
  validateParams(tagParamSchema),
  validateQuery(paginationQuerySchema),
  getArticlesByTag
);

// Get single article by slug (must be after /tag/:tag to avoid conflict)
// GET /api/v1/articles/:slug
router.get(
  "/:slug",
  optionalAuth,
  validateParams(slugParamSchema),
  getArticleBySlug
);

// ========== PROTECTED ROUTES (Auth Required) ==========

// Create new article (draft)
// POST /api/v1/articles
router.post(
  "/",
  authenticate,
  validateBody(createArticleSchema),
  createArticle
);

// Get article by ID (owner only, for editing)
// GET /api/v1/articles/id/:id
router.get(
  "/id/:id",
  authenticate,
  validateParams(articleIdParamSchema),
  getArticleById
);

// Update article (owner only)
// PATCH /api/v1/articles/:id
router.patch(
  "/:id",
  authenticate,
  validateParams(articleIdParamSchema),
  validateBody(updateArticleSchema),
  updateArticle
);

// Delete article (owner only)
// DELETE /api/v1/articles/:id
router.delete(
  "/:id",
  authenticate,
  validateParams(articleIdParamSchema),
  deleteArticle
);

// Publish article (owner only)
// POST /api/v1/articles/:id/publish
router.post(
  "/:id/publish",
  authenticate,
  validateParams(articleIdParamSchema),
  publishArticle
);

// Unpublish article (owner only)
// POST /api/v1/articles/:id/unpublish
router.post(
  "/:id/unpublish",
  authenticate,
  validateParams(articleIdParamSchema),
  unpublishArticle
);

// export router
export default router;
