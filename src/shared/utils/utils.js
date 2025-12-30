import crypto from "crypto";

/**
 * Generate a URL-safe slug from a title
 * @param {string} title - The title to convert
 * @returns {string} URL-safe slug
 */
export const generateSlug = (title) => {
  const result = [];
  let inWord = false; // FSM state

  for (let i = 0; i < title.length; i++) {
    let ch = title[i];

    // Normalize to lowercase (manual, faster & explicit)
    if (ch >= "A" && ch <= "Z") {
      ch = String.fromCharCode(ch.charCodeAt(0) + 32);
    }

    // Check valid slug character
    const isAlphaNum = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");

    if (isAlphaNum) {
      result.push(ch);
      inWord = true;
    } else {
      // Word boundary → insert dash only once
      if (inWord) {
        result.push("-");
        inWord = false;
      }
    }
  }

  // Remove trailing dash if present
  if (result.length && result[result.length - 1] === "-") {
    result.pop();
  }

  return result.join("");
};

/**
 * Generate a unique slug with random suffix
 * @param {string} title - The title to convert
 * @returns {string} Unique URL-safe slug with random suffix
 */
export const generateUniqueSlug = (title) => {
  const baseSlug = generateSlug(title);
  const suffix = crypto.randomBytes(3).toString("hex"); // 6 char hex
  return `${baseSlug}-${suffix}`;
};

/**
 * Extract plain text from block-based content
 * @param {Array} content - Array of content blocks
 * @returns {string} Plain text concatenated from all blocks
 */
export const extractPlainText = (content) => {
  if (!Array.isArray(content)) return "";

  return content
    .map((block) => {
      if (!block.data) return "";

      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
        case "callout":
          return block.data.text || "";
        case "code":
          return block.data.code || "";
        case "list":
          return Array.isArray(block.data.items)
            ? block.data.items.join(" ")
            : "";
        case "image":
          return block.data.caption || "";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ");
};

/**
 * Calculate word count from text
 * @param {string} text - Plain text
 * @returns {number} Word count
 */
export const calculateWordCount = (text) => {
  if (!text || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

/**
 * Calculate reading time in minutes (average 200 words per minute)
 * @param {number} wordCount - Number of words
 * @returns {number} Estimated reading time in minutes
 */
export const calculateReadingTime = (wordCount) => {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
};

/**
 * Generate excerpt from plain text
 * @param {string} text - Plain text
 * @param {number} maxLength - Maximum excerpt length
 * @returns {string} Truncated excerpt
 */
export const generateExcerpt = (text, maxLength = 300) => {
  if (!text || typeof text !== "string") return "";

  const cleaned = text.trim().replace(/\s+/g, " ");

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find last space before maxLength to avoid cutting words
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`;
};

/**
 * Calculate article metadata from content
 * @param {Array} content - Array of content blocks
 * @returns {Object} Metadata object with wordCount, readingTime, excerpt
 */
export const calculateArticleMetadata = (content) => {
  const plainText = extractPlainText(content);
  const wordCount = calculateWordCount(plainText);
  const readingTime = calculateReadingTime(wordCount);
  const excerpt = generateExcerpt(plainText);

  return {
    wordCount,
    readingTime,
    excerpt,
  };
};
