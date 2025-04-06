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
import {
  calculateCalories,
  createMultipleDietPlanItems,
  fetchSuggestedDietPlan,
  getOrCreateDietPlan,
  getOrCreateWorkoutPlan,
} from "../controllers/dietController.js";
import { getDailyStats, getStats } from "../controllers/statsController.js";
import { fetchSuggestedWorkoutPlan } from "../controllers/workoutController.js";
import {
  addToCart,
  addToWishlist,
  deleteFromCart,
  deleteFromWishlist,
  getCart,
  getWishlist,
} from "../controllers/productController.js";

const commonRouter = express.Router();
commonRouter.get("/me", verifyToken, Me);
commonRouter.get("/get-users", verifyToken, getUsersList);
commonRouter.get("/get-convo", verifyToken, getConversation);
commonRouter.post("/send-message", verifyToken, sendMessage);
commonRouter.get("/get-last-message", verifyToken, getLastMessages);

commonRouter.post("/update-profile", verifyToken, updateUserProfile);
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
  console.log(planId);
  res.send(planId);
});
commonRouter.get("/diet-plan-id", verifyToken, async (req, res) => {
  const planId = await getOrCreateDietPlan(req.userId);
  console.log(planId);
  res.send(planId);
});
commonRouter.get("/calories", verifyToken, async (req, res) => {
  const calories = await calculateCalories(req.userId);
  console.log(calories);
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

export default commonRouter;
