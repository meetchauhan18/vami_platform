/**
 * Service Layer - Barrel Export
 * Central point to import all services
 * 
 * Usage:
 * import { authService, userService, articleService } from '@/services';
 */

export { default as authService } from '../features/auth/service/auth.service.js';
export { default as userService } from '../features/user/service/user.service.js';
export { default as articleService } from '../features/article/service/article.service.js';
