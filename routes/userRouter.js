import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import {
  deleteUserWorkoutPlanItem,
  getUserWorkoutPlanItems,
  updateUserWorkoutPlanItems,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get(
  "/get-workout-plan",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  getUserWorkoutPlanItems
);
userRouter.put(
  "/update-workout-plan",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  updateUserWorkoutPlanItems
);
userRouter.delete(
  "/delete-workout-plan/:planItemId",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  deleteUserWorkoutPlanItem
);
export default userRouter;
