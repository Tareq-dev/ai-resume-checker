const { PDFParse } = require("pdf-parse");

const ApiError = require("../utils/ApiError");

async function extractText(buffer) {
  let parser;

  try {
    parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    const text = (result.text || "").trim();

    if (text.length < 50) {
      throw new ApiError(
        400,
        "Extracted text is too short, possibly due to an invalid PDF file"
      );
    }

    return {
      text,
      meta: {
        numPages: result.pages?.length ?? result.numpages ?? null,
        info: result.info,
        metadata: result.metadata,
      },
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to extract text from PDF: " + error.message
    );
  } finally {
    try {
      await parser?.destroy?.();
    } catch {}
  }
}

module.exports = { extractText };