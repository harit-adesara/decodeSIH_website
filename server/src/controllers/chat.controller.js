import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/Conversation.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { triageUserSymptomQuery } from "../services/gemini.service.js";

const PYTHON_CHATBOT_URL =
  process.env.PYTHON_CHATBOT_URL || "https://chatbot-d6q1.onrender.com/chat";

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
 * @desc    Create a new conversation
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({
    user: req.user._id,
    title: "New Conversation",
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
 * @desc    Send a message in a conversation
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
      signal: AbortSignal.timeout(60000),
    });

    if (!chatResponse.ok) {
      throw new Error(`Python chatbot returned status ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    botContent = chatData.response;

    if (!botContent) {
      throw new Error("Empty response from Python chatbot");
    }
  } catch (err) {
    console.warn("⚠️ Python chatbot unavailable, using fallback engine:", err.message);
    source = "fallback_engine";

    const fallbackResult = await triageUserSymptomQuery({
      message: message.trim(),
      state: req.user.state || "Maharashtra",
      district: req.user.district || "Pune",
      city: req.user.city || "All",
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
