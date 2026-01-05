import AppError from "../../shared/utils/AppError.js";
import {
  generateUniqueSlug,
  calculateArticleMetadata,
  extractPlainText,
} from "../../shared/utils/utils.js";
import { ARTICLE_STATUS } from "../../shared/constants/index.js";
import articleRepository from "./article.repository.js";
import userRepository from "../user/user.repository.js";

class ArticleService {
  constructor(ArticleRepository, UserRepository) {
    this.articleRepository = ArticleRepository;
    this.userRepository = UserRepository;
  }

  // ========== CREATE ==========

  /**
   * Create a new article (as draft)
   * @param {Object} params - { title, subtitle, content, tags, authorId, coverImage }
   * @returns {Promise<Object>} Created article
   */
  createArticle = async ({
    title,
    subtitle,
    content,
    tags,
    authorId,
    coverImage,
  }) => {
    // Generate unique slug
    const slug = generateUniqueSlug(title);

    // Calculate metadata from content
    const metadata = calculateArticleMetadata(content || []);

    // Add cover image to metadata if provided
    if (coverImage) {
      metadata.coverImage = coverImage;
    }

    // Extract plain text for search
    const plainText = extractPlainText(content || []);

    const articleData = {
      author: authorId,
      title,
      subtitle,
      slug,
      content: content || [],
      plainText,
      metadata,
      tags: tags || [],
      status: ARTICLE_STATUS.DRAFT,
    };

    const article = await this.articleRepository.create(articleData);

    // Populate author info before returning
    return this.articleRepository.findById(article._id, { populate: true });
  };

  // ========== READ ==========

  /**
   * Get published articles with pagination
   * @param {Object} options - { page, limit, sortBy, sortOrder, tag }
   */
  getPublishedArticles = async (options = {}) => {
    return this.articleRepository.findPublished(options);
  };

  /**
   * Get article by slug (for public viewing)
   * Increments view count if viewer is not the owner
   * @param {string} slug - Article slug
   * @param {string|null} userId - Current user ID (null if not authenticated)
   */
  getArticleBySlug = async (slug, userId = null) => {
    // First try to find published article
    let article = await this.articleRepository.findBySlug(slug, {
      includeUnpublished: false,
      populate: true,
    });

    // If not found and user is authenticated, check if they're the owner
    if (!article && userId) {
      article = await this.articleRepository.findBySlug(slug, {
        includeUnpublished: true,
        populate: true,
      });

      // If found but user is not the owner, deny access
      if (article && article.author._id.toString() !== userId.toString()) {
        throw AppError.notFoundError("Article not found");
      }
    }

    if (!article) {
      throw AppError.notFoundError("Article not found");
    }

    // Increment view count if viewer is not the owner
    if (
      article.status === ARTICLE_STATUS.PUBLISHED &&
      (!userId || article.author._id.toString() !== userId.toString())
    ) {
      await this.articleRepository.incrementStat(article._id, "views");
    }

    return article;
  };

  /**
   * Get article by ID (for owner operations)
   * @param {string} id - Article ID
   * @param {string} userId - Current user ID
   */
  getArticleById = async (id, userId) => {
    const article = await this.articleRepository.findById(id, {
      populate: true,
    });

    if (!article) {
      throw AppError.notFoundError("Article not found");
    }

    // Check ownership
    if (article.author._id.toString() !== userId.toString()) {
      throw AppError.unAuthorized(
        "You are not authorized to access this article"
      );
    }

    return article;
  };

  /**
   * Get articles by tag
   * @param {string} tag - Tag to filter by
   * @param {Object} options - Pagination options
   */
  getArticlesByTag = async (tag, options = {}) => {
    return this.articleRepository.findByTag(tag, options);
  };

  /**
   * Get current user's articles (all statuses)
   * @param {string} userId - User ID
   * @param {Object} options - { page, limit, status, sortBy, sortOrder }
   */
  getMyArticles = async (userId, options = {}) => {
    return this.articleRepository.findByAuthor(userId, options);
  };

  /**
   * Get user's published articles (public)
   * @param {string} username - Username
   * @param {Object} options - Pagination options
   */
  getUserArticles = async (username, options = {}) => {
    // First verify user exists
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    // Get only published articles
    return this.articleRepository.findByAuthor(user._id, {
      ...options,
      status: ARTICLE_STATUS.PUBLISHED,
    });
  };

  // ========== UPDATE ==========

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {string} userId - Current user ID
   * @param {Object} updateData - Fields to update
   */
  updateArticle = async (id, userId, updateData) => {
    // Verify ownership
    const article = await this.articleRepository.findByIdAndAuthor(id, userId);

    if (!article) {
      throw AppError.notFoundError(
        "Article not found or you are not authorized"
      );
    }

    const setUpdates = {};

    // Update title and regenerate slug if title changed
    if (updateData.title !== undefined && updateData.title !== article.title) {
      setUpdates.title = updateData.title;
      setUpdates.slug = generateUniqueSlug(updateData.title);
    }

    // Update subtitle
    if (updateData.subtitle !== undefined) {
      setUpdates.subtitle = updateData.subtitle;
    }

    // Update content and recalculate metadata
    if (updateData.content !== undefined) {
      setUpdates.content = updateData.content;
      setUpdates.plainText = extractPlainText(updateData.content);

      const metadata = calculateArticleMetadata(updateData.content);
      setUpdates["metadata.wordCount"] = metadata.wordCount;
      setUpdates["metadata.readingTime"] = metadata.readingTime;
      setUpdates["metadata.excerpt"] = metadata.excerpt;
    }

    // Update tags
    if (updateData.tags !== undefined) {
      setUpdates.tags = updateData.tags;
    }

    // Update cover image
    if (updateData.coverImage !== undefined) {
      setUpdates["metadata.coverImage"] = updateData.coverImage;
    }

    // Build proper update object with explicit operators
    const updateQuery = {
      $set: setUpdates,
      $inc: { version: 1 },
    };

    const updatedArticle = await this.articleRepository.update(id, updateQuery);

    return updatedArticle;
  };

  /**
   * Publish article (draft -> published)
   * @param {string} id - Article ID
   * @param {string} userId - Current user ID
   */
  publishArticle = async (id, userId) => {
    const article = await this.articleRepository.findByIdAndAuthor(id, userId);

    if (!article) {
      throw AppError.notFoundError(
        "Article not found or you are not authorized"
      );
    }

    if (article.status === ARTICLE_STATUS.PUBLISHED) {
      throw AppError.badRequestError("Article is already published");
    }

    // Validate article has required content before publishing
    if (!article.title || !article.content || article.content.length === 0) {
      throw AppError.badRequestError(
        "Article must have a title and content to be published"
      );
    }

    return this.articleRepository.updateStatus(id, ARTICLE_STATUS.PUBLISHED, {
      publishedAt: new Date(),
    });
  };

  /**
   * Unpublish article (published -> draft)
   * @param {string} id - Article ID
   * @param {string} userId - Current user ID
   */
  unpublishArticle = async (id, userId) => {
    const article = await this.articleRepository.findByIdAndAuthor(id, userId);

    if (!article) {
      throw AppError.notFoundError(
        "Article not found or you are not authorized"
      );
    }

    if (article.status !== ARTICLE_STATUS.PUBLISHED) {
      throw AppError.badRequestError("Article is not published");
    }

    return this.articleRepository.updateStatus(id, ARTICLE_STATUS.DRAFT, {
      $unset: { publishedAt: "" },
    });
  };

  // ========== DELETE ==========

  /**
   * Delete article
   * @param {string} id - Article ID
   * @param {string} userId - Current user ID
   */
  deleteArticle = async (id, userId) => {
    const article = await this.articleRepository.deleteByIdAndAuthor(
      id,
      userId
    );

    if (!article) {
      throw AppError.notFoundError(
        "Article not found or you are not authorized"
      );
    }

    return article;
  };
}

export default new ArticleService(articleRepository, userRepository);
