import multer from "multer";
import AppError from "./AppError.js";

/**
 * Upload configurations for different use cases
 */
const UPLOAD_LIMITS = {
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  cover: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  article: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video",
    ],
  },
};

/**
 * File filter factory - validates file type
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequestError(
          `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };
};

/**
 * Create multer upload instance for specific type
 */
const createUpload = (type) => {
  const config = UPLOAD_LIMITS[type];

  if (!config) {
    throw AppError.internalServerError(`Unknown upload type: ${type}`);
  }

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxSize,
    },
    fileFilter: createFileFilter(config.allowedTypes),
  });
};

/**
 * Middleware to handle multer errors and convert to AppError
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return next(AppError.badRequestError("File too large"));
      case "LIMIT_FILE_COUNT":
        return next(AppError.badRequestError("Too many files"));
      case "LIMIT_UNEXPECTED_FILE":
        return next(AppError.badRequestError(`Unexpected field: ${err.field}`));
      default:
        return next(AppError.badRequestError(err.message));
    }
  }

  // Pass through other errors (including our AppError from fileFilter)
  next(err);
};

/**
 * Pre-configured upload instances
 */
export const avatarUpload = createUpload("avatar");
export const coverUpload = createUpload("cover");
export const articleUpload = createUpload("article");

export { handleMulterError, createUpload, UPLOAD_LIMITS };
export default { avatarUpload, coverUpload, articleUpload, handleMulterError };
