// local imports
import apiClient from '../../../shared/api/apiClient.js';
import { urlBuilder } from '../../../shared/constants/urlBuilder.js';

class AuthService {
  constructor(client) {
    this.client = client;
  }

  async login(credentials) {
    const response = await this.client.post(
      urlBuilder.auth.login(),
      credentials
    );
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post(
      urlBuilder.auth.register(),
      userData
    );
    return response.data;
  }

  async logout() {
    const response = await this.client.post(urlBuilder.auth.logout());
    return response.data;
  }

  async logoutAll() {
    const response = await this.client.post(urlBuilder.auth.logoutAll());
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get(urlBuilder.auth.profile());
    return response.data;
  }

  async verifyEmail(token) {
    const response = await this.client.post(urlBuilder.auth.verifyEmail(), {
      token,
    });
    return response.data;
  }

  async resendVerificationEmail() {
    const response = await this.client.post(
      urlBuilder.auth.resendVerification()
    );
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.client.post(
      urlBuilder.auth.forgotPassword(),
      { email }
    );
    return response.data;
  }

  async resetPassword(data) {
    const response = await this.client.post(
      urlBuilder.auth.resetPassword(),
      data
    );
    return response.data;
  }

  async isAuthenticated() {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService(apiClient);
