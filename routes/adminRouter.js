import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import {
  createUsers,
  deleteUser,
 
  getUserById,
  getUsers,
  modifyUser,
} from "../controllers/adminController.js";
import {
  createActivity,
  createWorkoutLog,
  createWorkoutPlanItem,
  deleteActivity,
  deleteWorkoutLog,
  deleteWorkoutPlanItem,
  getAllActivities,
  getAllWorkoutLogs,
  getAllWorkoutPlanItems,
  getWorkoutLog,
  getWorkoutPlanItem,
  modifyActivity,
  updateWorkoutLog,
  updateWorkoutPlanItem,
} from "../controllers/workoutController.js";
import {
  createWorkoutPlan,
  deleteWorkoutPlan,
  getAllWorkoutPlans,
  updateWorkoutPlan,
  viewWorkoutPlan,
} from "../controllers/planController.js";

const adminRouter = express.Router();

adminRouter.get(
  "/get-users",
  verifyToken,
  checkPermissions(["VIEW_USERS"]),
  getUsers
);

adminRouter.get(
  "/get-users/:userId",
  verifyToken,
  checkPermissions(["VIEW_USERS"]),
  getUserById
);
adminRouter.post(
  "/create-users",
  verifyToken,
  checkPermissions(["CREATE_USER"]),
  createUsers
);
adminRouter.put(
  "/update-users/:userId",
  verifyToken,
  checkPermissions(["MODIFY_USER"]),
  modifyUser
);

adminRouter.delete(
  "/delete-users/:userId",
  verifyToken,
  checkPermissions(["DELETE_USER"]),
  deleteUser
);

adminRouter.get(
  "/get-activities",
  verifyToken,
  checkPermissions(["VIEW_ACTIVITY"]),
  getAllActivities
);

adminRouter.post(
  "/create-activity",
  verifyToken,
  checkPermissions(["CREATE_ACTIVITY"]),
  createActivity
);

adminRouter.put(
  "/update-activity/:activityId",
  verifyToken,
  checkPermissions(["MODIFY_ACTIVITY"]),
  modifyActivity
);

adminRouter.delete(
  "/delete-activity/:activityId",
  verifyToken,
  checkPermissions(["DELETE_ACTIVITY"]),
  deleteActivity
);

adminRouter.post(
  "/create-workout-plan",
  verifyToken,
  checkPermissions(["CREATE_WORKOUT_PLAN"]),
  createWorkoutPlan
);
adminRouter.put(
  "/update-workout-plan/:id",
  verifyToken,
  checkPermissions(["MODIFY_WORKOUT_PLAN"]),
  updateWorkoutPlan
);

adminRouter.get(
  "/get-workout-plans/:id",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_PLAN"]),
  viewWorkoutPlan
);

adminRouter.get(
  "/get-workout-plans",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_PLAN"]),
  getAllWorkoutPlans
);

adminRouter.delete(
  "/delete-workout-plan/:id",
  verifyToken,
  checkPermissions(["DELETE_WORKOUT_PLAN"]),
  deleteWorkoutPlan
);

adminRouter.get(
  "/get-workout-plan-items/:id",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_ITEMS"]),
  getWorkoutPlanItem
);
adminRouter.get(
  "/get-workout-plan-items",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_ITEMS"]),
  getAllWorkoutPlanItems
);
adminRouter.post(
  "/create-workout-plan-item",
  verifyToken,
  checkPermissions(["CREATE_WORKOUT_ITEM"]),
  createWorkoutPlanItem
);
adminRouter.put(
  "/update-workout-plan-item/:id",
  verifyToken,
  checkPermissions(["MODIFY_WORKOUT_ITEM"]),
  updateWorkoutPlanItem
);
adminRouter.delete(
  "/delete-workout-plan-item/:id",
  verifyToken,
  checkPermissions(["DELETE_WORKOUT_ITEM"]),
  deleteWorkoutPlanItem
);

adminRouter.post(
  "/create-workout-log",
  verifyToken,
  checkPermissions(["CREATE_WORKOUT_LOG"]),
  createWorkoutLog
);
adminRouter.get(
  "/get-workout-logs",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_LOG"]),
  getAllWorkoutLogs
);
adminRouter.get(
  "/get-workout-log/:id",
  verifyToken,
  checkPermissions(["VIEW_WORKOUT_LOG"]),
  getWorkoutLog
);
adminRouter.put(
  "/update-workout-log/:id",
  verifyToken,
  checkPermissions(["MODIFY_WORKOUT_LOG"]),
  updateWorkoutLog
);
adminRouter.delete(
  "/delete-workout-log/:id",
  verifyToken,
  checkPermissions(["DELETE_WORKOUT_LOG"]),
  deleteWorkoutLog
);
export default adminRouter;
