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
export default userRouter;
