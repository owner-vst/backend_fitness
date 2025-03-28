import express from "express";
import { Me } from "../utils/Me.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getConversation,
  getLastMessages,
  sendMessage,
} from "../controllers/chatController.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/profileController.js";
const commonRouter = express.Router();
commonRouter.get("/me", verifyToken, Me);
commonRouter.get("/get-convo", verifyToken, getConversation);
commonRouter.post("/send-message", verifyToken, sendMessage);
commonRouter.get("/get-last-message", verifyToken, getLastMessages);

commonRouter.put("/update-profile", verifyToken, updateUserProfile);
commonRouter.get("/get-profile", verifyToken, getUserProfile);
export default commonRouter;
