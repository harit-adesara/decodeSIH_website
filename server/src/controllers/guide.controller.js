// Path: server/src/controllers/guide.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateWebsiteGuideResponse } from "../services/guideLlm.service.js";
import { transcribeAudioWithSarvam } from "../services/sarvam.service.js";

/**
 * @desc    Guide LLM Chat endpoint for website navigation
 * @route   POST /api/v1/public/guide
 * @access  Public
 * @payload { message: string, chat_history: Array<{ role: string, content: string, timestamp?: string }> }
 */
export const handleGuideChat = asyncHandler(async (req, res) => {
  const { message, chat_history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      response: "Message is required.",
    });
  }

  const result = await generateWebsiteGuideResponse({
    message: message.trim(),
    chat_history: Array.isArray(chat_history) ? chat_history : [],
  });

  return res.status(200).json({
    success: result.success,
    response: result.response,
    source: result.source,
  });
});

/**
 * @desc    Sarvam AI Speech-to-Text (STT) transcription endpoint for Indian languages
 * @route   POST /api/v1/public/guide/stt
 * @access  Public
 * @payload multipart/form-data with `audio` or `file` and optional `language_code`
 */
export const handleGuideSTT = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  const language_code = req.body?.language_code || "unknown";

  if (!file || !file.buffer) {
    throw new ApiError(400, "Audio file is required for Speech-to-Text transcription.");
  }

  const sttResult = await transcribeAudioWithSarvam({
    audioBuffer: file.buffer,
    mimetype: file.mimetype || "audio/webm",
    originalname: file.originalname || "recording.webm",
    language_code,
  });

  if (!sttResult.success) {
    return res.status(200).json({
      success: false,
      transcript: "",
      message: sttResult.message || sttResult.error || "STT transcription could not be completed.",
    });
  }

  return res.status(200).json({
    success: true,
    transcript: sttResult.transcript,
    language_code: sttResult.language_code,
  });
});

