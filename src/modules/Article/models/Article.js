import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    // Author reference
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Core content
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    subtitle: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    // Block-based content
    content: [
      {
        blockId: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "paragraph",
            "heading",
            "code",
            "image",
            "quote",
            "list",
            "callout",
            "divider",
            "embed",
          ],
          required: true,
        },
        data: { type: mongoose.Schema.Types.Mixed },
        order: { type: Number },
      },
    ],
    // Plain text for search
    plainText: { type: String, select: false },
    // Metadata
    metadata: {
      readingTime: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      excerpt: { type: String, maxlength: 300 },
      coverImage: {
        url: { type: String },
        alt: { type: String },
      },
    },
    // Publishing
    status: {
      type: String,
      enum: ["draft", "published", "archived", "unlisted"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
    // Categorization
    tags: [{ type: String, lowercase: true, trim: true }],
    // Version tracking
    version: { type: Number, default: 1 },
    // Stats (denormalized)
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);
// Indexes
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ "stats.views": -1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
