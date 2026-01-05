import Article from "./models/Article.js";
import {
  PAGINATION,
  ARTICLE_STATUS,
  SORT_ORDER,
} from "../../shared/constants/index.js";

class ArticleRepository {
  constructor(ArticleModel) {
    this.Article = ArticleModel;
  }

  // ========== CREATE ==========

  /**
   * Create a new article
   * @param {Object} articleData - Article data including author, title, content, etc.
   * @returns {Promise<Document>} Created article document
   */
  create = async (articleData) => {
    const article = new this.Article(articleData);
    return article.save();
  };

  // ========== READ ==========

  /**
   * Find article by ID
   * @param {string} id - Article ID
   * @param {Object} options - Query options { populate: boolean }
   */
  findById = async (id, options = {}) => {
    let query = this.Article.findById(id);

    if (options.populate) {
      query = query.populate(
        "author",
        "username profile.displayName profile.avatar"
      );
    }

    return query;
  };

  /**
   * Find article by ID and verify author ownership
   * @param {string} id - Article ID
   * @param {string} authorId - Author's user ID
   */
  findByIdAndAuthor = async (id, authorId) => {
    return this.Article.findOne({ _id: id, author: authorId });
  };

  /**
   * Find article by slug
   * @param {string} slug - Article slug
   * @param {Object} options - Query options { includeUnpublished: boolean, populate: boolean }
   */
  findBySlug = async (slug, options = {}) => {
    const query = { slug };

    // By default, only return published articles
    if (!options.includeUnpublished) {
      query.status = ARTICLE_STATUS.PUBLISHED;
    }

    let mongoQuery = this.Article.findOne(query);

    if (options.populate) {
      mongoQuery = mongoQuery.populate(
        "author",
        "username profile.displayName profile.avatar"
      );
    }

    return await mongoQuery.lean().exec();
  };

  /**
   * Find published articles with pagination and sorting
   * @param {Object} options - { page, limit, sortBy, sortOrder, tag }
   */
  findPublished = async (options = {}) => {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = "publishedAt",
      sortOrder = SORT_ORDER.DESC,
      tag = null,
    } = options;

    const query = { status: ARTICLE_STATUS.PUBLISHED };

    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1 };

    const [articles, total] = await Promise.all([
      this.Article.find(query)
        .populate("author", "username profile.displayName profile.avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.Article.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  };

  /**
   * Find articles by author ID with optional status filter
   * @param {string} authorId - Author's user ID
   * @param {Object} options - { page, limit, status, sortBy, sortOrder }
   */
  findByAuthor = async (authorId, options = {}) => {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status = null,
      sortBy = "createdAt",
      sortOrder = SORT_ORDER.DESC,
    } = options;

    const query = { author: authorId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1 };

    const [articles, total] = await Promise.all([
      this.Article.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.Article.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  };

  /**
   * Find articles by tag
   * @param {string} tag - Tag to search for
   * @param {Object} options - Pagination options
   */
  findByTag = async (tag, options = {}) => {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } =
      options;

    const query = { tags: tag, status: ARTICLE_STATUS.PUBLISHED };
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.Article.find(query)
        .populate("author", "username profile.displayName profile.avatar")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.Article.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  };

  // ========== UPDATE ==========

  /**
   * Update article by ID
   * @param {string} id - Article ID
   * @param {Object} updateData - Fields to update
   * @param {Object} options - Mongoose options (default: { new: true })
   */
  update = async (id, updateData, options = { new: true }) => {
    return this.Article.findByIdAndUpdate(id, updateData, options).populate(
      "author",
      "username profile.displayName profile.avatar"
    );
  };

  /**
   * Update article status
   * @param {string} id - Article ID
   * @param {string} status - New status (use ARTICLE_STATUS constants)
   * @param {Object} additionalUpdates - Additional fields to update (e.g., publishedAt)
   */
  updateStatus = async (id, status, additionalUpdates = {}) => {
    return this.Article.findByIdAndUpdate(
      id,
      { status, ...additionalUpdates },
      { new: true }
    ).populate("author", "username profile.displayName profile.avatar");
  };

  /**
   * Increment article stats atomically
   * @param {string} id - Article ID
   * @param {string} stat - Stat field to increment ('views', 'likes', 'comments', 'bookmarks')
   * @param {number} value - Value to increment by (default: 1)
   */
  incrementStat = async (id, stat, value = 1) => {
    return this.Article.findByIdAndUpdate(
      id,
      { $inc: { [`stats.${stat}`]: value } },
      { new: true }
    );
  };

  /**
   * Save article document instance
   * @param {Document} article - Article document
   */
  save = async (article) => {
    return article.save();
  };

  // ========== DELETE ==========

  /**
   * Delete article by ID
   * @param {string} id - Article ID
   */
  delete = async (id) => {
    return this.Article.findByIdAndDelete(id);
  };

  /**
   * Delete article by ID and verify author ownership
   * @param {string} id - Article ID
   * @param {string} authorId - Author's user ID
   */
  deleteByIdAndAuthor = async (id, authorId) => {
    return this.Article.findOneAndDelete({ _id: id, author: authorId });
  };

  // ========== UTILITY ==========

  /**
   * Check if slug exists
   * @param {string} slug - Slug to check
   * @returns {Promise<boolean>}
   */
  slugExists = async (slug) => {
    const count = await this.Article.countDocuments({ slug });
    return count > 0;
  };
}

export default new ArticleRepository(Article);
