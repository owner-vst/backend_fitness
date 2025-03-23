import express from "express";
import { Me } from "../utils/Me.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getConversation,
  getLastMessages,
  sendMessage,
} from "../controllers/chatController.js";
import {
  createProfile,
  getUserProfile,
  updateProfile,
} from "../controllers/profileController.js";
const commonRouter = express.Router();
commonRouter.get("/me", verifyToken, Me);
commonRouter.get("/get-convo", verifyToken, getConversation);
commonRouter.post("/send-message", verifyToken, sendMessage);
commonRouter.get("/get-last-message", verifyToken, getLastMessages);
commonRouter.post("/create-profile", verifyToken, createProfile);
commonRouter.put("/update-profile/:id", verifyToken, updateProfile);
commonRouter.get("/get-profile", verifyToken, getUserProfile);
export default commonRouter;
