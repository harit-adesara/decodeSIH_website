import { Router } from "express";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  updateConversationLocation,
  getBotLocation,
  updateBotLocation,
  handleChatSTT,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { uploadAudio } from "../middleware/upload.middleware.js";

const router = Router();

// Public bot endpoints (authenticated via API key, not JWT)
router.get("/bot/location", getBotLocation);
router.put("/bot/location", updateBotLocation);

// Protected user endpoints (JWT required)
router.use(verifyJWT);

router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.delete("/conversations/:id", deleteConversation);
router.put("/conversations/:id/location", updateConversationLocation);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);
router.post("/stt", uploadAudio.any(), handleChatSTT);

export default router;
