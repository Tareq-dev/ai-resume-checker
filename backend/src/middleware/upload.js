const multure = require("multer");
const ApiError = require("../utils/ApiError");

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const upload = multure({
  storage: multure.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype !== "application/pdf") {
      return cb(new ApiError.badRequest("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

const uploadPdf =
  (field = "file") =>
  (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (err instanceof multure.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError.badRequest("File size exceeds the limit of 5MB"),
          );
        }
      }
      if (err) return next(err);
      if (!req.file) {
        return next(new ApiError.badRequest("No file uploaded"));
      }
      next();
    });
  };
module.exports = { uploadPdf };
