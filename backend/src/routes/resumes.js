const expess = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");

const { requireAuth } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { uploadPdf } = require("../middlewares/upload");

const { excractText } = require("../services/pdfService");
const { perseResume: perseStructure } = require("../services/stuctureParser");

const router = expess.Router();
router.use(requireAuth);

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.inValidObjectId(v), { message: "Invalid id" });

const idParam = z.object({ id: objectIdSchema });

async function loadOwenedResume(req) {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!resume) throw ApiError.notFound("Resume not found");
  return resume;
}

async function loadVersion(resumeId, versionId) {
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId });
  if (!version) throw ApiError.notFound("Version not found");
  return version;
}

router.post(
  "/",
  uploadPdf("file"),
  asyncHandler(async (req, res) => {
    const { text, meta } = await extractText(req.file.buffer);
    const parsedSections = await parseStructured(text);

    const title =
      (req.body.title || "").trim() ||
      req.file.originalname.replace(/\.pdf$/i, "") ||
      "Utitled Resume";

    const resume = await Resume.create({
      userId: req.user._id,
      title,
      latestVersionNumer: 1,
    });

    const version = await ResumeVersion.create({
      resumeId: resume._id,
      versionNumber: 1,
      label: "V1",
      rawText: text,
      parsedSections,
      sourceType: "upload",
      parentVersionId: "null",
    });
    resume.currentVersionId = version._id;
    await resume.save();
  }),
);
