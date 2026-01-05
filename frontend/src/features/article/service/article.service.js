// local imports
import apiClient from '../../../shared/api/apiClient.js';
import { urlBuilder } from '../../../shared/constants/urlBuilder.js';

class ArticleService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getArticles(params = {}) {
    const response = await this.apiClient.get(urlBuilder.article.list(params));
    return response.data;
  }

  async getArticlesByTag(tag, params = {}) {
    const response = await this.apiClient.get(
      urlBuilder.article.byTag(tag, params)
    );
    return response.data;
  }

  async getArticleBySlug(slug) {
    const response = await this.apiClient.get(urlBuilder.article.bySlug(slug));
    return response.data;
  }

  async getArticleById(id) {
    const response = await this.apiClient.get(urlBuilder.article.byId(id));
    return response.data;
  }


  async createArticle(articleData) {
    const response = await this.apiClient.post(
      urlBuilder.article.create(),
      articleData
    );
    return response.data;
  }

  async updateArticle(id, articleData) {
    const response = await this.apiClient.patch(
      urlBuilder.article.update(id),
      articleData
    );
    return response.data;
  }

  async deleteArticle(id) {
    const response = await this.apiClient.delete(urlBuilder.article.delete(id));
    return response.data;
  }

  async publishArticle(id) {
    const response = await this.apiClient.post(urlBuilder.article.publish(id));
    return response.data;
  }

  async unpublishArticle(id) {
    const response = await this.apiClient.post(urlBuilder.article.unpublish(id));
    return response.data;
  }

  async searchArticles(searchParams = {}) {
    const response = await this.apiClient.get(
      urlBuilder.article.list(searchParams)
    );
    return response.data;
  }
}

export default new ArticleService(apiClient);
