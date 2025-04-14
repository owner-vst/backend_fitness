import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import {
  createActivityUser,
  createDietPlanItem,
  createFoodCatalogueUser,
  createWorkoutPlanItem,
  deleteUserDietPlanItem,
  deleteUserWorkoutPlanItem,
  getActivities,
  getFoodCatalogue,
  getUserDietPlanItems,
  getUserWorkoutPlanItems,
  updateUserDietPlanItem,
  updateUserWorkoutPlanItems,
  userDashboard,
  vendorDashboard,
} from "../controllers/userController.js";
import { getWeeklyProgressStats } from "../controllers/DietStatsController.js";
import {
  getProductById,
  getProducts,
  getRelatedProducts,
} from "../controllers/productController.js";
import {
  createOrder,
  getAllOrderItems,
  viewUserOrders,
} from "../controllers/orderController.js";

const userRouter = express.Router();

userRouter.get(
  "/get-workout-plan",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_PLAN"]),
  getUserWorkoutPlanItems
);
userRouter.put(
  "/update-workout-plan",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_PLAN"]),
  updateUserWorkoutPlanItems
);
userRouter.delete(
  "/delete-workout-plan/:planItemId",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_PLAN"]),
  deleteUserWorkoutPlanItem
);
userRouter.post(
  "/create-workout-plan-item",
  verifyToken,
  createWorkoutPlanItem
);
userRouter.post("/create-activity", verifyToken, createActivityUser);

//diet-plan
userRouter.get(
  "/get-diet-plan",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  getUserDietPlanItems
);
userRouter.put(
  "/update-diet-plan",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  updateUserDietPlanItem
);
userRouter.delete(
  "/delete-diet-plan/:planItemId",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  deleteUserDietPlanItem
);
userRouter.post("/create-diet-plan-item", verifyToken, createDietPlanItem);
userRouter.get("/get-food-catalogue", verifyToken, getFoodCatalogue);
userRouter.post("/create-food-item", verifyToken, createFoodCatalogueUser);
userRouter.get("/get-weekly-diet-stats", verifyToken, getWeeklyProgressStats);
userRouter.get("/get-activities", verifyToken, getActivities);
userRouter.get("/get-user-dashboard", verifyToken, userDashboard);
userRouter.get("/get-vendor-dashboard", verifyToken, vendorDashboard);

userRouter.get("/get-products", verifyToken, getProducts);
userRouter.get("/get-product-by-id/:id", verifyToken, getProductById);
userRouter.get("/get-related-products", verifyToken, getRelatedProducts);
userRouter.get(
  "/get-user-orders",
  verifyToken,

  viewUserOrders
);
userRouter.get(
  "/get-all-order-items/:id",
  verifyToken,

  getAllOrderItems
);
userRouter.post("/create-order", verifyToken, createOrder);
export default userRouter;
