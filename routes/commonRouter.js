import express from "express";
import { Me } from "../utils/Me.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getConversation,
  getLastMessages,
  getUsersList,
  sendMessage,
  unreadMessagesCount,
} from "../controllers/chatController.js";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
} from "../controllers/profileController.js";
import {
  calculateCalories,
  createMultipleDietPlanItems,
  fetchSuggestedDietPlan,
  getOrCreateDailyProgress,
  getOrCreateDietPlan,
} from "../controllers/dietController.js";
import { getDailyStats, getStats } from "../controllers/statsController.js";
import {
  fetchSuggestedWorkoutPlan,
  getOrCreateWorkoutPlan,
} from "../controllers/workoutController.js";
import {
  addToCart,
  addToWishlist,
  deleteFromCart,
  deleteFromWishlist,
  getCart,
  getProductNameList,
  getWishlist,
} from "../controllers/productController.js";

const commonRouter = express.Router();
commonRouter.get("/me", verifyToken, Me);
commonRouter.get("/get-users", verifyToken, getUsersList);
commonRouter.get("/get-convo", verifyToken, getConversation);
commonRouter.post("/send-message", verifyToken, sendMessage);
commonRouter.get("/unread-messages-count", verifyToken, unreadMessagesCount);
commonRouter.get("/get-last-message", verifyToken, getLastMessages);

commonRouter.post("/update-profile", verifyToken, updateUserProfile);
commonRouter.post("/upload-profile-picture", verifyToken, uploadProfilePicture);
commonRouter.get("/get-profile", verifyToken, getUserProfile);

commonRouter.get("/suggest-diet-plan", verifyToken, fetchSuggestedDietPlan);
commonRouter.get(
  "/suggest-workout-plan",
  verifyToken,
  fetchSuggestedWorkoutPlan
);
commonRouter.get("/personal-stats", verifyToken, getStats);
commonRouter.get("/workout-stats", verifyToken, getDailyStats);
commonRouter.get("/workout-plan-id", verifyToken, async (req, res) => {
  const planId = await getOrCreateWorkoutPlan(req.userId);

  res.send(planId);
});
commonRouter.get("/diet-plan-id", verifyToken, async (req, res) => {
  const planId = await getOrCreateDietPlan(req.userId);

  res.send(planId);
});
commonRouter.get("/get-daily-progress-id", verifyToken, async (req, res) => {
  const dailyProgress = await getOrCreateDailyProgress(req.userId);

  res.send(dailyProgress);
});
commonRouter.get("/calories", verifyToken, async (req, res) => {
  const calories = await calculateCalories(req.userId);

  res.send(calories);
});
commonRouter.get(
  "/create-ai-plan-item",
  verifyToken,
  createMultipleDietPlanItems
);

commonRouter.post("/add-to-cart", verifyToken, addToCart);
commonRouter.get("/get-cart", verifyToken, getCart);
commonRouter.post("/add-to-wishlist", verifyToken, addToWishlist);
commonRouter.get("/get-wishlist", verifyToken, getWishlist);
commonRouter.delete(
  "/delete-from-wishlist/:productId",
  verifyToken,
  deleteFromWishlist
);
commonRouter.delete(
  "/delete-from-cart/:productId",
  verifyToken,
  deleteFromCart
);
commonRouter.get("/get-product-name-list", verifyToken, getProductNameList);
export default commonRouter;
