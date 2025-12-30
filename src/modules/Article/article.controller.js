import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import articleService from "./article.service.js";

class ArticleController {
  constructor(ArticleService) {
    this.articleService = ArticleService;
  }

  // ========== CREATE ==========

  /**
   * POST /articles - Create a new article (draft)
   */
  createArticle = asyncHandler(async (req, res) => {
    const { title, subtitle, content, tags, coverImage } = req.body;

    const article = await this.articleService.createArticle({
      title,
      subtitle,
      content,
      tags,
      coverImage,
      authorId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article,
    });
  });

  // ========== READ ==========

  /**
   * GET /articles - List published articles with pagination
   */
  getArticles = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, tag } = req.query;

    const result = await this.articleService.getPublishedArticles({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || "publishedAt",
      sortOrder: sortOrder || "desc",
      tag,
    });

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: result.articles,
      pagination: result.pagination,
    });
  });

  /**
   * GET /articles/:slug - Get article by slug
   */
  getArticleBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const userId = req.user?._id || null;

    const article = await this.articleService.getArticleBySlug(slug, userId);

    res.status(200).json({
      success: true,
      message: "Article fetched successfully",
      data: article,
    });
  });

  /**
   * GET /articles/id/:id - Get article by ID (owner only)
   */
  getArticleById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const article = await this.articleService.getArticleById(id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Article fetched successfully",
      data: article,
    });
  });

  /**
   * GET /articles/tag/:tag - Get articles by tag
   */
  getArticlesByTag = asyncHandler(async (req, res) => {
    const { tag } = req.params;
    const { page, limit } = req.query;

    const result = await this.articleService.getArticlesByTag(tag, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: result.articles,
      pagination: result.pagination,
    });
  });

  /**
   * GET /me/articles - Get current user's articles (all statuses)
   */
  getMyArticles = asyncHandler(async (req, res) => {
    const { page, limit, status, sortBy, sortOrder } = req.query;

    const result = await this.articleService.getMyArticles(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status: status || null,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    });

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: result.articles,
      pagination: result.pagination,
    });
  });

  /**
   * GET /users/:username/articles - Get user's published articles
   */
  getUserArticles = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page, limit } = req.query;

    const result = await this.articleService.getUserArticles(username, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: result.articles,
      pagination: result.pagination,
    });
  });

  // ========== UPDATE ==========

  /**
   * PATCH /articles/:id - Update article (owner only)
   */
  updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, content, tags, coverImage } = req.body;

    const article = await this.articleService.updateArticle(id, req.user._id, {
      title,
      subtitle,
      content,
      tags,
      coverImage,
    });

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      data: article,
    });
  });

  /**
   * POST /articles/:id/publish - Publish article (owner only)
   */
  publishArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const article = await this.articleService.publishArticle(id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Article published successfully",
      data: article,
    });
  });

  /**
   * POST /articles/:id/unpublish - Unpublish article (owner only)
   */
  unpublishArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const article = await this.articleService.unpublishArticle(
      id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Article unpublished successfully",
      data: article,
    });
  });

  // ========== DELETE ==========

  /**
   * DELETE /articles/:id - Delete article (owner only)
   */
  deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await this.articleService.deleteArticle(id, req.user._id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  });
}

export default new ArticleController(articleService);
