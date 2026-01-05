// local imports
import apiClient from '../../../shared/api/apiClient.js';
import { urlBuilder } from '../../../shared/constants/index.js';

/**
 * Article Service
 * Handles all article-related operations (CRUD, publishing, etc.)
 */
class ArticleService {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get published articles (public)
   * @param {Object} params - { page?, limit?, sortBy?, tag? }
   * @returns {Promise<Object>} { data: articles[], meta: pagination }
   */
  async getArticles(params = {}) {
    const response = await this.client.get(urlBuilder.article.list(params));
    return response.data;
  }

  /**
   * Get articles by tag
   * @param {string} tag - Tag name
   * @param {Object} params - { page?, limit?, sortBy? }
   * @returns {Promise<Object>} { data: articles[], meta: pagination }
   */
  async getArticlesByTag(tag, params = {}) {
    const response = await this.client.get(
      urlBuilder.article.byTag(tag, params)
    );
    return response.data;
  }

  /**
   * Get single article by slug (public)
   * @param {string} slug - Article slug
   * @returns {Promise<Object>} Article data
   */
  async getArticleBySlug(slug) {
    const response = await this.client.get(urlBuilder.article.bySlug(slug));
    return response.data;
  }

  /**
   * Get article by ID (authenticated, for editing)
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Full article data including drafts
   */
  async getArticleById(id) {
    const response = await this.client.get(urlBuilder.article.byId(id));
    return response.data;
  }

  /**
   * Create new article (draft)
   * @param {Object} articleData - { title, content, excerpt?, tags?, coverImage? }
   * @returns {Promise<Object>} Created article
   */
  async createArticle(articleData) {
    const response = await this.client.post(
      urlBuilder.article.create(),
      articleData
    );
    return response.data;
  }

  /**
   * Update article (owner only)
   * @param {string} id - Article ID
   * @param {Object} articleData - Fields to update
   * @returns {Promise<Object>} Updated article
   */
  async updateArticle(id, articleData) {
    const response = await this.client.patch(
      urlBuilder.article.update(id),
      articleData
    );
    return response.data;
  }

  /**
   * Delete article (owner only)
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Success message
   */
  async deleteArticle(id) {
    const response = await this.client.delete(urlBuilder.article.delete(id));
    return response.data;
  }

  /**
   * Publish article (make public)
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Published article
   */
  async publishArticle(id) {
    const response = await this.client.post(urlBuilder.article.publish(id));
    return response.data;
  }

  /**
   * Unpublish article (revert to draft)
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Unpublished article
   */
  async unpublishArticle(id) {
    const response = await this.client.post(urlBuilder.article.unpublish(id));
    return response.data;
  }

  /**
   * Search articles (with filters)
   * @param {Object} searchParams - { query?, tags?, author?, page?, limit? }
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchArticles(searchParams = {}) {
    const response = await this.client.get(
      urlBuilder.article.list(searchParams)
    );
    return response.data;
  }
}

// Export singleton instance
export default new ArticleService(apiClient);
