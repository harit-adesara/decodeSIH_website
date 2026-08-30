// Path: server/src/services/sarvam.service.js
/**
 * Bharat Swasthya AI - Sarvam AI Speech-to-Text (STT) Service
 * Supports 10+ Indian Languages: Hindi, Bengali, Gujarati, Kannada, Malayalam,
 * Marathi, Odia, Punjabi, Tamil, Telugu, English.
 */

export const transcribeAudioWithSarvam = async ({
  audioBuffer,
  mimetype = "audio/wav",
  originalname = "audio.wav",
  language_code = "unknown",
  model = "saaras:v3",
}) => {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey || apiKey === "your_sarvam_api_key_here") {
    return {
      success: false,
      transcript: "",
      language_code: language_code || "hi-IN",
      message: "SARVAM_API_KEY is not set in server/.env.",
    };
  }

  try {
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: mimetype });
    formData.append("file", audioBlob, originalname || "recording.wav");
    formData.append("model", model || "saarika:v2.5");

    if (language_code && language_code !== "auto" && language_code !== "unknown") {
      formData.append("language_code", language_code);
    } else {
      formData.append("language_code", "unknown");
    }

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: formData,
      signal: AbortSignal.timeout(60000), // 60s timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        transcript: "",
        error: `Sarvam STT returned status ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      transcript: data.transcript || "",
      language_code: data.language_code || language_code,
    };
  } catch (err) {
    return {
      success: false,
      transcript: "",
      error: err.message,
    };
  }
};

