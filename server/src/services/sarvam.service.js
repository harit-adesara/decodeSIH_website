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

  console.log("--------------------------------------------------");
  console.log("🎙️ [Sarvam STT Request]");
  console.log(`🗣️ Target Language: ${language_code || "unknown (auto-detect)"}`);
  console.log(`🤖 Model: ${model || "saarika:v2.5"}`);
  console.log(`📦 Audio Size: ${audioBuffer?.length || 0} bytes (${mimetype})`);

  if (!apiKey || apiKey === "your_sarvam_api_key_here") {
    console.warn("⚠️ SARVAM_API_KEY is not configured in server/.env");
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
      const errorText = await response.text();
      console.error(`❌ [Sarvam STT API Error] HTTP ${response.status}:`, errorText);
      return {
        success: false,
        transcript: "",
        error: `Sarvam STT returned status ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    console.log(`✅ [Sarvam STT Success] Transcribed: "${data.transcript}" (Lang: ${data.language_code})`);

    return {
      success: true,
      transcript: data.transcript || "",
      language_code: data.language_code || language_code,
    };
  } catch (err) {
    console.error("❌ [Sarvam STT Fetch Exception]:", err.message);
    return {
      success: false,
      transcript: "",
      error: err.message,
    };
  }
};
