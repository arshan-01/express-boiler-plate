import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File Storage Abstraction
 * Supports local filesystem and can be extended for S3
 */

class LocalStorage {
  constructor(basePath = path.join(__dirname, "../../uploads")) {
    this.basePath = basePath;
    this.ensureDirectory();
  }

  async ensureDirectory() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (err) {
      logger.error({ err, basePath: this.basePath }, "Failed to create upload directory");
    }
  }

  async save(file, filename) {
    const filePath = path.join(this.basePath, filename);
    await fs.writeFile(filePath, file.buffer || file);
    return filePath;
  }

  async delete(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (err) {
      if (err.code !== "ENOENT") {
        logger.error({ err, filePath }, "Failed to delete file");
      }
      return false;
    }
  }

  async exists(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(filename) {
    return `/uploads/${filename}`;
  }
}

// Export singleton instance
export const storage = new LocalStorage();

/**
 * File upload validation
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
export function fileUploadValidator({
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedMimeTypes = [],
  allowedExtensions = []
} = {}) {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? Object.values(req.files).flat() : [req.file];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of ${maxSize / 1024 / 1024}MB`
        });
      }

      // Check MIME type
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed`,
          allowedTypes: allowedMimeTypes
        });
      }

      // Check extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `File extension ${ext} is not allowed`,
          allowedExtensions
        });
      }
    }

    next();
  };
}

/**
 * Generate unique filename
 * @param {string} originalname - Original filename
 * @returns {string} Unique filename
 */
export function generateFilename(originalname) {
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${basename}-${timestamp}-${random}${ext}`;
}
