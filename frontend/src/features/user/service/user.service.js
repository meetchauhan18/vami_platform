// local imports
import apiClient from '../../../shared/api/apiClient.js';
import { urlBuilder } from '../../../shared/constants/urlBuilder.js';

class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }


  async getMyProfile() {
    const response = await this.apiClient.get(urlBuilder.user.me());
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.apiClient.patch(
      urlBuilder.user.me(),
      profileData
    );
    return response.data;
  }

  async getPublicProfile(username) {
    const response = await this.apiClient.get(urlBuilder.user.byUsername(username));
    return response.data;
  }

  async getMyArticles(params = {}) {
    const response = await this.apiClient.get(urlBuilder.user.myArticles(params));
    return response.data;
  }

  async getUserArticles(username, params = {}) {
    const response = await this.apiClient.get(
      urlBuilder.user.userArticles(username, params)
    );
    return response.data;
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.apiClient.post(
      urlBuilder.user.avatar(),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteAvatar() {
    const response = await this.apiClient.delete(urlBuilder.user.avatar());
    return response.data;
  }

  /**
   * Upload cover image
   * @param {File} file - Image file (FormData)
   * @returns {Promise<Object>} { coverImageUrl }
   */
  async uploadCover(file) {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await this.apiClient.post(
      urlBuilder.user.cover(),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Delete cover image
   * @returns {Promise<Object>} Success message
   */
  async deleteCover() {
    const response = await this.apiClient.delete(urlBuilder.user.cover());
    return response.data;
  }
}

// Export singleton instance
export default new UserService(apiClient);
