import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import {
  createDietPlanItem,
  createFoodCatalogueUser,
  deleteUserDietPlanItem,
  deleteUserWorkoutPlanItem,
  getFoodCatalogue,
  getUserDietPlanItems,
  getUserWorkoutPlanItems,
  updateUserDietPlanItem,
  updateUserWorkoutPlanItems,
} from "../controllers/userController.js";

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
export default userRouter;
