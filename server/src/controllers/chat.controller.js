import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/Conversation.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { triageUserSymptomQuery } from "../services/gemini.service.js";

const PYTHON_CHATBOT_URL =
  process.env.PYTHON_CHATBOT_URL || "https://chatbot-d6q1.onrender.com/chat";

/**
 * Middleware-like helper: verify chatbot API key from header
 */
const verifyBotApiKey = (req) => {
  const apiKey = req.headers["x-chatbot-api-key"];
  if (!apiKey || apiKey !== process.env.CHATBOT_API_KEY) {
    throw new ApiError(403, "Invalid or missing chatbot API key.");
  }
};

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select("-__v");

  return res.status(200).json(
    new ApiResponse(200, { conversations }, "Conversations retrieved successfully.")
  );
});

/**
 * @desc    Create a new conversation (captures user's current location)
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({
    user: req.user._id,
    title: "New Conversation",
    location: {
      state: req.user.state || "All",
      district: req.user.district || "All",
      city: req.user.city || "All",
    },
  });

  return res.status(201).json(
    new ApiResponse(201, { conversation }, "New conversation created.")
  );
});

/**
 * @desc    Get paginated messages for a conversation
 * @route   GET /api/v1/chat/conversations/:id/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [messages, totalCount] = await Promise.all([
    ChatMessage.find({ conversation: id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v"),
    ChatMessage.countDocuments({ conversation: id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      messages,
    }, "Messages retrieved successfully.")
  );
});

/**
 * @desc    Send a message in a conversation (auto-injects location on first message)
 * @route   POST /api/v1/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message is required.");
  }

  const conversation = await Conversation.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  const userMessage = await ChatMessage.create({
    conversation: id,
    role: "user",
    content: message.trim(),
  });

  const messageCount = await ChatMessage.countDocuments({ conversation: id });
  if (messageCount === 1) {
    conversation.title = message.trim().slice(0, 50) + (message.length > 50 ? "..." : "");
    await conversation.save({ validateBeforeSave: false });
  }

  const loc = conversation.location || {};
  const locState = loc.state || req.user.state || "Maharashtra";
  const locDistrict = loc.district || req.user.district || "Pune";
  const locCity = loc.city || req.user.city || "All";

  let botContent;
  let source = "python_chatbot";

  try {
    const chatResponse = await fetch(PYTHON_CHATBOT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mongo_id: id,
        query: message.trim(),
      }),
      signal: AbortSignal.timeout(120000), // 2 min timeout for AI Chatbot
    });

    if (!chatResponse.ok) {
      throw new Error(`Python chatbot returned status ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    botContent = chatData.response;

    if (!botContent) {
      throw new Error("Empty response from Python chatbot");
    }
  } catch {
    source = "fallback_engine";

    const fallbackResult = await triageUserSymptomQuery({
      message: message.trim(),
      state: locState,
      district: locDistrict,
      city: locCity,
      history: [],
      activeAlerts: [],
    });

    botContent = fallbackResult.reply;
  }

  const botMessage = await ChatMessage.create({
    conversation: id,
    role: "assistant",
    content: botContent,
    source,
  });

  await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });

  return res.status(200).json(
    new ApiResponse(200, {
      userMessage,
      botMessage,
    }, "Message sent successfully.")
  );
});

/**
 * @desc    Delete a conversation and all its messages
 * @route   DELETE /api/v1/chat/conversations/:id
 * @access  Private
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  await ChatMessage.deleteMany({ conversation: id });
  await Conversation.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Conversation deleted successfully.")
  );
});

/**
 * @desc    Update conversation location (for subsequent AI responses)
 * @route   PUT /api/v1/chat/conversations/:id/location
 * @access  Private
 */
export const updateConversationLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { state, district, city } = req.body;

  const conversation = await Conversation.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  if (state !== undefined) conversation.location.state = state.trim();
  if (district !== undefined) conversation.location.district = district.trim();
  if (city !== undefined) conversation.location.city = city.trim();

  await conversation.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { conversation }, "Conversation location updated.")
  );
});

/**
 * @desc    Get location for a conversation (called by Python chatbot)
 * @route   GET /api/v1/chat/bot/location
 * @access  Public (API key required)
 */
export const getBotLocation = asyncHandler(async (req, res) => {
  verifyBotApiKey(req);

  const { conversation_id } = req.query;
  if (!conversation_id) {
    throw new ApiError(400, "conversation_id is required.");
  }

  const conversation = await Conversation.findById(conversation_id).select("location");
  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      state: conversation.location?.state || "All",
      district: conversation.location?.district || "All",
      city: conversation.location?.city || "All",
    }, "Location retrieved.")
  );
});

/**
 * @desc    Save location for a conversation (called by Python chatbot)
 * @route   PUT /api/v1/chat/bot/location
 * @access  Public (API key required)
 */
export const updateBotLocation = asyncHandler(async (req, res) => {
  verifyBotApiKey(req);

  const { conversation_id, state, district, city } = req.body;
  if (!conversation_id) {
    throw new ApiError(400, "conversation_id is required.");
  }

  const conversation = await Conversation.findById(conversation_id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  if (state !== undefined) conversation.location.state = state.trim();
  if (district !== undefined) conversation.location.district = district.trim();
  if (city !== undefined) conversation.location.city = city.trim();

  await conversation.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {
      success: true,
      location: conversation.location,
    }, "Location saved.")
  );
});
