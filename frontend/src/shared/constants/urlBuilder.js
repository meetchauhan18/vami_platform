/**
 * API Builder - Centralized URL builder with validation and type safety
 * Provides consistent URL generation across the application
 */
class UrlBuilder {
  constructor(baseURL, version) {
    this.baseURL = baseURL;
    this.apiVersion = version;
  }

  build(path) {
    if (!path.startsWith("/")) {
      throw new Error(`Invalid API path: "${path}". Path must start with '/'`);
    }
    return `${this.baseURL}${this.apiVersion}${path}`;
  }

  /**
   * Build URL with query parameters
   * @param {string} path - API endpoint path
   * @param {Object} params - Query parameters object
   * @returns {string} Complete URL with query string
   */
  buildWithQuery(path, params = {}) {
    const url = this.build(path);
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    );

    const query = new URLSearchParams(filteredParams).toString();
    return query ? `${url}?${query}` : url;
  }

  sanitize(segment) {
    if (!segment || typeof segment !== "string") {
      throw new Error(`Invalid URL segment: ${segment}`);
    }
    return encodeURIComponent(segment.trim());
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth = {
    login: () => this.build("/auth/login"),
    register: () => this.build("/auth/register"),
    refresh: () => this.build("/auth/refresh-token"),
    logout: () => this.build("/auth/logout"),
    logoutAll: () => this.build("/auth/logout-all"),
    profile: () => this.build("/auth/profile"),
    verifyEmail: () => this.build("/auth/verify-email"),
    resendVerification: () => this.build("/auth/resend-verification"),
    forgotPassword: () => this.build("/auth/forgot-password"),
    resetPassword: () => this.build("/auth/reset-password"),
  };

  // ============================================
  // USER ENDPOINTS
  // ============================================
  user = {
    me: () => this.build("/users/me"),

    myArticles: (params) => this.buildWithQuery("/users/me/articles", params),

    avatar: () => this.build("/users/me/avatar"),

    cover: () => this.build("/users/me/cover"),

    byUsername: (username) => {
      const sanitized = this.sanitize(username);
      return this.build(`/users/${sanitized}`);
    },

    userArticles: (username, params) => {
      const sanitized = this.sanitize(username);
      return this.buildWithQuery(`/users/${sanitized}/articles`, params);
    },
  };

  // ============================================
  // ARTICLE ENDPOINTS
  // ============================================
  article = {
    list: (params) => this.buildWithQuery("/articles", params),

    create: () => this.build("/articles"),

    bySlug: (slug) => {
      const sanitized = this.sanitize(slug);
      return this.build(`/articles/${sanitized}`);
    },

    byId: (id) => {
      if (!id) throw new Error("Article ID is required");
      return this.build(`/articles/id/${id}`);
    },

    update: (id) => {
      if (!id) throw new Error("Article ID is required");
      return this.build(`/articles/${id}`);
    },

    delete: (id) => {
      if (!id) throw new Error("Article ID is required");
      return this.build(`/articles/${id}`);
    },

    publish: (id) => {
      if (!id) throw new Error("Article ID is required");
      return this.build(`/articles/${id}/publish`);
    },

    unpublish: (id) => {
      if (!id) throw new Error("Article ID is required");
      return this.build(`/articles/${id}/unpublish`);
    },

    byTag: (tag, params) => {
      const sanitized = this.sanitize(tag);
      return this.buildWithQuery(`/articles/tag/${sanitized}`, params);
    },
  };

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================
  admin = {
    users: () => this.build("/admin/users"),
    stats: () => this.build("/admin/stats"),
  };

  // ============================================
  // HEALTH CHECK
  // ============================================
  health = () => {
    return `/health`;
  };
}

// Create singleton instance
export const urlBuilder = new UrlBuilder(
  import.meta.env.VITE_BACKEND_URL,
  import.meta.env.VITE_API_VERSION
);

// Export class for testing/mocking
export { UrlBuilder };
