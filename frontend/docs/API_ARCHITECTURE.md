# API Builder Architecture Guide

## 🏗️ Architecture Overview

This frontend uses a **Future-Proof UrlBuilder Pattern** for API endpoint management.

### Why UrlBuilder?

✅ **Type-Safe URL Generation** - Validates paths at runtime  
✅ **Automatic Query String Building** - Handles pagination, filters, etc.  
✅ **Centralized Endpoint Management** - Single source of truth  
✅ **Environment-Aware** - Automatically uses correct base URL  
✅ **Testable & Mockable** - Easy to mock for unit tests  
✅ **Scalable** - Handles 1000+ endpoints gracefully  

---

## 📁 File Structure

```
src/
├── shared/
│   ├── api/
│   │   ├── apiClient.js              # Configured axios instance
│   │   ├── client/
│   │   │   ├── axiosInstance.js      # Base axios config
│   │   │   └── interceptors.js       # Request/response interceptors
│   │   └── handlers/
│   │       ├── handle401.js          # Auto token refresh
│   │       ├── normalizeError.js     # Error standardization
│   │       └── normalizeResponse.js  # Response unwrapping
│   ├── constants/
│   │   ├── urlBuilder.js             # ⭐ API endpoint builder
│   │   └── index.js                  # Constants barrel export
│   └── utils/
│       └── utils.js                  # Utility functions
├── features/
│   ├── auth/service/auth.service.js      # Auth operations
│   ├── user/service/user.service.js      # User operations
│   └── article/service/article.service.js # Article operations
└── services/
    └── index.js                      # Service barrel export
```

---

## 🎯 Usage Examples

### 1. Basic Service Usage

```javascript
import { authService, userService, articleService } from '@/services';

// Login
const { user, accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
});

// Get user profile
const profile = await userService.getMyProfile();

// Get articles with pagination
const { data: articles, meta } = await articleService.getArticles({
  page: 1,
  limit: 10,
  sortBy: 'publishedAt',
  tag: 'javascript'
});
```

### 2. Direct UrlBuilder Usage (Advanced)

```javascript
import { urlBuilder } from '@/shared/constants';
import apiClient from '@/shared/api/apiClient';

// Static endpoints
const loginUrl = urlBuilder.auth.login();
// → 'http://localhost:3000/api/v1/auth/login'

// Dynamic params
const userUrl = urlBuilder.user.byUsername('johndoe');
// → 'http://localhost:3000/api/v1/users/johndoe'

// With query params
const articlesUrl = urlBuilder.article.list({ page: 2, limit: 20 });
// → 'http://localhost:3000/api/v1/articles?page=2&limit=20'

// Custom request
const response = await apiClient.get(articlesUrl);
```

### 3. Error Handling

All errors are normalized:

```javascript
try {
  await authService.login(credentials);
} catch (error) {
  console.log(error.message);     // User-friendly message
  console.log(error.code);        // 'UNAUTHORIZED', 'VALIDATION_ERROR', etc.
  console.log(error.status);      // 401, 422, etc.
  console.log(error.isAuthError); // true/false
  console.log(error.details);     // Validation details if any
}
```

### 4. Response Structure

All responses are normalized:

```javascript
const response = await articleService.getArticles();

// Normalized structure:
{
  data: [...],        // The actual data
  meta: {             // Pagination metadata
    page: 1,
    limit: 10,
    total: 100
  },
  message: "...",     // Success message
  success: true       // Always true for successful responses
}

// You can destructure directly:
const { data: articles, meta } = await articleService.getArticles();
```

---

## 🔐 Authentication Flow

### Automatic Token Refresh

The system automatically handles expired tokens:

1. API call returns **401 Unauthorized**
2. Interceptor catches error
3. Calls `urlBuilder.auth.refresh()` automatically
4. Retries original request with new token
5. If refresh fails → Logout user

**You don't need to handle 401 errors manually.**

### Cookie-Based Auth

- Tokens are stored in **httpOnly cookies** (secure)
- `withCredentials: true` is configured
- No manual token management needed
- Works automatically with interceptors

---

## 📊 Available Services

### AuthService

| Method | Description | Params |
|--------|-------------|--------|
| `login(credentials)` | Login user | `{ email, password, rememberMe? }` |
| `register(userData)` | Register new user | `{ username, email, password, displayName? }` |
| `logout()` | Logout current device | None |
| `logoutAll()` | Logout all devices | None |
| `getProfile()` | Get current user profile | None |
| `verifyEmail(token)` | Verify email | `token: string` |
| `resendVerificationEmail()` | Resend verification | None |
| `forgotPassword(email)` | Request reset | `email: string` |
| `resetPassword(data)` | Reset password | `{ token, password, rememberMe? }` |

### UserService

| Method | Description | Params |
|--------|-------------|--------|
| `getMyProfile()` | Get full profile | None |
| `updateProfile(data)` | Update profile | Profile fields |
| `getPublicProfile(username)` | Get public profile | `username: string` |
| `getMyArticles(params)` | Get my articles | `{ status?, page?, limit? }` |
| `getUserArticles(username, params)` | Get user articles | `username, { page?, limit? }` |
| `uploadAvatar(file)` | Upload avatar | `file: File` |
| `deleteAvatar()` | Delete avatar | None |
| `uploadCover(file)` | Upload cover | `file: File` |
| `deleteCover()` | Delete cover | None |

### ArticleService

| Method | Description | Params |
|--------|-------------|--------|
| `getArticles(params)` | List published | `{ page?, limit?, sortBy?, tag? }` |
| `getArticlesByTag(tag, params)` | Filter by tag | `tag, { page?, limit? }` |
| `getArticleBySlug(slug)` | Get by slug | `slug: string` |
| `getArticleById(id)` | Get by ID (auth) | `id: string` |
| `createArticle(data)` | Create draft | Article data |
| `updateArticle(id, data)` | Update article | `id, data` |
| `deleteArticle(id)` | Delete article | `id: string` |
| `publishArticle(id)` | Publish | `id: string` |
| `unpublishArticle(id)` | Unpublish | `id: string` |
| `searchArticles(params)` | Search | `{ query?, tags?, author? }` |

---

## 🧪 Testing

### Mocking Services

```javascript
// In tests
import { authService } from '@/services';

jest.mock('@/services', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ user: mockUser }),
    getProfile: jest.fn().mockResolvedValue(mockProfile),
  }
}));
```

### Mocking UrlBuilder

```javascript
import { UrlBuilder } from '@/shared/constants/urlBuilder';

const mockBuilder = new UrlBuilder('http://localhost:4000', '/mock');
jest.mock('@/shared/constants/urlBuilder', () => ({
  urlBuilder: mockBuilder
}));
```

---

## 🔧 Configuration

### Environment Variables

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_VERSION=/api/v1
VITE_API_TIMEOUT=10000
```

### Adding New Endpoints

1. Open `src/shared/constants/urlBuilder.js`
2. Add method to appropriate section:

```javascript
article = {
  // ... existing methods
  
  // New endpoint
  featured: () => this.build('/articles/featured'),
  
  // With params
  byCategory: (category, params) => 
    this.buildWithQuery(`/articles/category/${this.sanitize(category)}`, params)
}
```

3. Use in service:

```javascript
async getFeaturedArticles() {
  const response = await this.client.get(urlBuilder.article.featured());
  return response.data;
}
```

---

## 🚀 Best Practices

### ✅ DO

- **Always use services** for API calls (not apiClient directly)
- **Use urlBuilder** for URL generation
- **Destructure data** from responses: `const { data } = await service.method()`
- **Handle errors** in components, not services
- **Pass query params** as objects: `{ page: 1, limit: 10 }`

### ❌ DON'T

- **Don't hardcode URLs** anywhere
- **Don't concatenate baseURL** manually
- **Don't handle 401 errors** (interceptor does it)
- **Don't store tokens** in localStorage
- **Don't bypass services** for direct axios calls

---

## 📈 Scalability Notes

This architecture scales from **10 to 10,000 endpoints** without refactoring.

### As Your API Grows:

1. **New Modules** → Add new section in `urlBuilder`
2. **New Services** → Create new service file, export in barrel
3. **API Versioning** → Create `apiBuilderV2` instance
4. **Microservices** → Create separate builders per service

### Performance:

- ✅ URL building is **O(1)** - instantaneous
- ✅ No regex parsing or complex logic
- ✅ Query params are built once and cached
- ✅ Tree-shakable - unused endpoints don't bloat bundle

---

## 🔄 Migration from Old Pattern

If you have old code with hardcoded URLs:

```javascript
// ❌ OLD WAY
axios.get('http://localhost:3000/api/v1/auth/login')

// ✅ NEW WAY
import { authService } from '@/services';
authService.login(credentials)
```

---

## 📚 Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [API Design Best Practices](https://restfulapi.net/)
- Backend API Docs: `http://localhost:3000/api/v1/health`

---

**Last Updated:** January 5, 2026  
**Maintainer:** VAMI Platform Team
