import multer from "multer";
import { storage, generateFilename } from "../utils/storage.js";

/**
 * Multer configuration for file uploads
 */

// Memory storage (for processing before saving)
const memoryStorage = multer.memoryStorage();

// Disk storage (saves directly to disk)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storage.basePath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file.originalname));
  }
});

/**
 * Create multer upload middleware
 * @param {Object} options - Upload options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {string[]} options.allowedMimeTypes - Allowed MIME types
 * @param {boolean} options.memory - Use memory storage (default: true)
 * @returns {Function} Multer middleware
 */
export function createUploadMiddleware({
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedMimeTypes = [],
  memory = true
} = {}) {
  const upload = multer({
    storage: memory ? memoryStorage : diskStorage,
    limits: {
      fileSize: maxSize
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`)
        );
      }
      cb(null, true);
    }
  });

  return upload;
}

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName, options) => {
  return createUploadMiddleware(options).single(fieldName);
};

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName, maxCount = 10, options) => {
  return createUploadMiddleware(options).array(fieldName, maxCount);
};

/**
 * Multiple fields upload middleware
 */
export const uploadFields = (fields, options) => {
  return createUploadMiddleware(options).fields(fields);
};
