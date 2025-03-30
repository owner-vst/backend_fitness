import express from "express";
import { Me } from "../utils/Me.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getConversation,
  getLastMessages,
  getUsersList,
  sendMessage,
} from "../controllers/chatController.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/profileController.js";
import { fetchSuggestedDietPlan } from "../controllers/dietController.js";

const commonRouter = express.Router();
commonRouter.get("/me", verifyToken, Me);
commonRouter.get("/get-users", verifyToken, getUsersList);
commonRouter.get("/get-convo", verifyToken, getConversation);
commonRouter.post("/send-message", verifyToken, sendMessage);
commonRouter.get("/get-last-message", verifyToken, getLastMessages);

commonRouter.post("/update-profile", verifyToken, updateUserProfile);
commonRouter.get("/get-profile", verifyToken, getUserProfile);

commonRouter.get("/suggest-diet-plan", verifyToken, fetchSuggestedDietPlan);

export default commonRouter;
