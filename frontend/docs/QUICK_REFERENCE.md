# 🚀 API Quick Reference - Cheat Sheet

## 📥 Imports

```javascript
// Services (most common)
import { authService, userService, articleService } from '@/services';

// UrlBuilder (advanced usage)
import { urlBuilder } from '@/shared/constants';

// Error codes & HTTP status
import { ERROR_CODES, HTTP_STATUS, HEADERS } from '@/shared/constants';

// Direct API client (rare)
import apiClient from '@/shared/api/apiClient';
```

---

## 🔐 Auth Operations

```javascript
// Login
const { user, accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true // optional
});

// Register
const user = await authService.register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'secure123',
  displayName: 'John Doe' // optional
});

// Get profile
const profile = await authService.getProfile();

// Logout
await authService.logout(); // Current device
await authService.logoutAll(); // All devices

// Password reset flow
await authService.forgotPassword('user@example.com');
await authService.resetPassword({ token, password });

// Email verification
await authService.verifyEmail(token);
await authService.resendVerificationEmail();

// Check auth status
const isAuth = await authService.isAuthenticated(); // true/false
```

---

## 👤 User Operations

```javascript
// Get current user profile
const profile = await userService.getMyProfile();

// Update profile
const updated = await userService.updateProfile({
  displayName: 'New Name',
  bio: 'Developer',
  location: 'San Francisco',
  website: 'https://example.com'
});

// Get public profile
const publicProfile = await userService.getPublicProfile('johndoe');

// Get my articles (all statuses)
const { data, meta } = await userService.getMyArticles({
  status: 'draft', // 'draft', 'published', or omit for all
  page: 1,
  limit: 10,
  sortBy: 'createdAt' // or 'publishedAt', 'updatedAt'
});

// Get user's published articles
const articles = await userService.getUserArticles('johndoe', { page: 1 });

// Avatar operations
await userService.uploadAvatar(fileObject);
await userService.deleteAvatar();

// Cover image operations
await userService.uploadCover(fileObject);
await userService.deleteCover();
```

---

## 📰 Article Operations

```javascript
// List published articles (public)
const { data, meta } = await articleService.getArticles({
  page: 1,
  limit: 10,
  sortBy: 'publishedAt', // 'publishedAt', 'createdAt', 'updatedAt'
  tag: 'javascript' // optional filter
});

// Get by slug (public)
const article = await articleService.getArticleBySlug('my-first-post');

// Get by ID (authenticated, for editing)
const article = await articleService.getArticleById('article-id-123');

// Get by tag
const { data, meta } = await articleService.getArticlesByTag('react', {
  page: 1,
  limit: 20
});

// Create article (draft)
const newArticle = await articleService.createArticle({
  title: 'My First Post',
  content: 'Article content here...',
  excerpt: 'Short description',
  tags: ['javascript', 'tutorial'],
  coverImage: 'https://...' // optional
});

// Update article
const updated = await articleService.updateArticle('article-id', {
  title: 'Updated Title',
  content: 'Updated content'
});

// Delete article
await articleService.deleteArticle('article-id');

// Publish/Unpublish
const published = await articleService.publishArticle('article-id');
const draft = await articleService.unpublishArticle('article-id');

// Search articles
const results = await articleService.searchArticles({
  query: 'react hooks',
  tags: ['react'],
  author: 'johndoe',
  page: 1
});
```

---

## 🛠️ Error Handling

```javascript
try {
  await authService.login(credentials);
} catch (error) {
  // Normalized error object
  console.log(error.message);     // "Invalid credentials"
  console.log(error.code);        // "UNAUTHORIZED"
  console.log(error.status);      // 401
  console.log(error.isAuthError); // true
  console.log(error.details);     // Validation details (if any)
  
  // Check error type
  if (error.isAuthError) {
    // Handle auth errors
  } else if (error.isNetworkError) {
    // Handle network errors
  }
}
```

---

## 🔗 UrlBuilder Direct Usage

```javascript
import { urlBuilder } from '@/shared/constants';
import apiClient from '@/shared/api/apiClient';

// Static endpoints
const loginUrl = urlBuilder.auth.login();
// → http://localhost:3000/api/v1/auth/login

// Dynamic params
const userUrl = urlBuilder.user.byUsername('johndoe');
// → http://localhost:3000/api/v1/users/johndoe

// With query params
const articlesUrl = urlBuilder.article.list({ page: 2, limit: 20 });
// → http://localhost:3000/api/v1/articles?page=2&limit=20

// Custom request
const response = await apiClient.get(articlesUrl);
const data = response.data; // Already normalized
```

---

## 🎨 React Component Examples

### Login Component
```javascript
import { useState } from 'react';
import { authService } from '@/services';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await authService.login({ email, password });
      console.log('Welcome,', user.username);
      // Redirect to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Article List Component
```javascript
import { useEffect, useState } from 'react';
import { articleService } from '@/services';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, meta } = await articleService.getArticles({
          page,
          limit: 10,
          sortBy: 'publishedAt'
        });
        setArticles(data);
        setPagination(meta);
      } catch (error) {
        console.error('Failed to load articles:', error);
      }
    };

    fetchArticles();
  }, [page]);

  return (
    <div>
      {articles.map(article => (
        <article key={article._id}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <span>By {article.author.username}</span>
        </article>
      ))}
      
      {pagination && (
        <div>
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page * pagination.limit >= pagination.total}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### File Upload Component
```javascript
import { useState } from 'react';
import { userService } from '@/services';

function AvatarUpload() {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await userService.uploadAvatar(file);
      console.log('Avatar uploaded:', result.avatarUrl);
      // Update UI with new avatar
    } catch (error) {
      console.error('Upload failed:', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
```

---

## 📊 Response Structures

### Success Response
```javascript
{
  data: { ... },          // Actual data
  meta: { ... },          // Pagination/metadata (optional)
  message: "Success",     // Success message
  success: true           // Always true
}

// Destructure directly
const { data, meta } = await service.method();
```

### Error Response
```javascript
{
  message: "Error message",       // User-friendly message
  code: "UNAUTHORIZED",           // Error code constant
  status: 401,                    // HTTP status
  details: [...],                 // Validation details (if any)
  isNetworkError: false,
  isAuthError: true,
  isTimeout: false,
  originalError: { ... }          // Full axios error
}
```

---

## 🧪 Testing Cheat Sheet

```javascript
// Mock entire service
jest.mock('@/services', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ user: mockUser }),
    getProfile: jest.fn().mockResolvedValue(mockProfile),
  },
  articleService: {
    getArticles: jest.fn().mockResolvedValue({ data: [], meta: {} }),
  }
}));

// Mock UrlBuilder
jest.mock('@/shared/constants/urlBuilder', () => ({
  urlBuilder: {
    auth: {
      login: () => '/mock/auth/login'
    }
  }
}));

// Test with actual services (integration test)
import { authService } from '@/services';

test('login returns user', async () => {
  const result = await authService.login({ email: 'test@test.com', password: 'test' });
  expect(result.user).toBeDefined();
});
```

---

## 🔍 Debugging Tips

```javascript
// Enable request logging
apiClient.interceptors.request.use(config => {
  console.log('→', config.method.toUpperCase(), config.url);
  return config;
});

// Enable response logging
apiClient.interceptors.response.use(response => {
  console.log('←', response.status, response.config.url);
  return response;
});

// Check if endpoint is correct
console.log(urlBuilder.auth.login());
// Should print: http://localhost:3000/api/v1/auth/login

// Check query params
console.log(urlBuilder.article.list({ page: 1, tag: 'react' }));
// Should print: http://localhost:3000/api/v1/articles?page=1&tag=react
```

---

## 🚨 Common Mistakes to Avoid

```javascript
// ❌ DON'T: Import axios directly
import axios from 'axios';
axios.get('http://localhost:3000/...');

// ✅ DO: Use services
import { authService } from '@/services';
await authService.login(credentials);

// ❌ DON'T: Hardcode URLs
apiClient.get('/auth/login');

// ✅ DO: Use UrlBuilder
apiClient.get(urlBuilder.auth.login());

// ❌ DON'T: Manual query strings
const url = `/articles?page=${page}&limit=${limit}`;

// ✅ DO: Let UrlBuilder handle it
const url = urlBuilder.article.list({ page, limit });

// ❌ DON'T: Store tokens manually
localStorage.setItem('token', token);

// ✅ DO: Let cookies handle it (automatic)
await authService.login(credentials); // Tokens stored in httpOnly cookies

// ❌ DON'T: Handle 401 in every component
try {
  await service.method();
} catch (error) {
  if (error.status === 401) { /* refresh token */ }
}

// ✅ DO: Let interceptor handle it (automatic)
await service.method(); // 401 handled automatically
```

---

## 📖 Quick Links

- **Full Documentation:** [API_ARCHITECTURE.md](./API_ARCHITECTURE.md)
- **Implementation Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **UrlBuilder Source:** [urlBuilder.js](../src/shared/constants/urlBuilder.js)
- **Services:** [auth](../src/features/auth/service/auth.service.js) | [user](../src/features/user/service/user.service.js) | [article](../src/features/article/service/article.service.js)

---

**Last Updated:** January 5, 2026  
**Print This:** Keep as desk reference for daily development
