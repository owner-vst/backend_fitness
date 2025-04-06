import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import {
  adminDashboard,
  createUsers,
  deleteUser,
  getUserById,
  getUsers,
  modifyUser,
} from "../controllers/adminController.js";
import {
  createActivity,
  createWorkoutPlanItem,
  deleteActivity,
  deleteWorkoutPlanItem,
  getAllActivities,
  getAllWorkoutPlanItems,
  getWorkoutPlanItem,
  modifyActivity,
  updateWorkoutPlanItem,
} from "../controllers/workoutController.js";
import {
  createDietPlan,
  createWorkoutPlan,
  deleteDietPlan,
  deleteWorkoutPlan,
  getAllDietPlans,
  getAllWorkoutPlans,
  updateDietPlan,
  updateWorkoutPlan,
  viewDietPlan,
  viewWorkoutPlan,
} from "../controllers/planController.js";
import {
  createDietPlanItem,
  createFoodCatalogue,
  deleteDietPlanItem,
  deleteFoodCatalogue,
  getAllDietPlanItems,
  getAllFoodCatalogue,
  getFoodCatalogueById,
  modifyFoodCatalogue,
  updateDietPlanItem,
  viewDietPlanItem,
} from "../controllers/dietController.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  viewProduct,
  viewProductsByUser,
} from "../controllers/productController.js";
import {
  createOrder,
  deleteOrder,
  updateOrder,
  viewAllOrders,
  viewOrder,
  viewUserOrders,
} from "../controllers/orderController.js";

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

// DietItem routes
adminRouter.post(
  "/create-food-item",
  verifyToken,
  checkPermissions(["CREATE_FOOD_ITEM"]),
  createFoodCatalogue
);
adminRouter.get(
  "/get-food-items",
  verifyToken,
  checkPermissions(["VIEW_FOOD_ITEMS"]),
  getAllFoodCatalogue
);
adminRouter.get(
  "/get-food-item/:foodId",
  verifyToken,
  checkPermissions(["VIEW_FOOD_ITEMS"]),
  getFoodCatalogueById
);
adminRouter.put(
  "/update-food-item/:foodId",
  verifyToken,
  checkPermissions(["MODIFY_FOOD_ITEM"]),
  modifyFoodCatalogue
);
adminRouter.delete(
  "/delete-food-item/:foodId",
  verifyToken,
  checkPermissions(["DELETE_FOOD_ITEM"]),
  deleteFoodCatalogue
);

//dietplan routes
adminRouter.get(
  "/get-diet-plans",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  getAllDietPlans
);

adminRouter.get(
  "/get-diet-plan/:id",
  verifyToken,
  checkPermissions(["VIEW_DIET_PLAN"]),
  viewDietPlan
);

adminRouter.post(
  "/create-diet-plan",
  verifyToken,
  checkPermissions(["CREATE_DIET_PLAN"]),
  createDietPlan
);

adminRouter.put(
  "/update-diet-plan/:id",
  verifyToken,
  checkPermissions(["MODIFY_DIET_PLAN"]),
  updateDietPlan
);

adminRouter.delete(
  "/delete-diet-plan/:id",
  verifyToken,
  checkPermissions(["DELETE_DIET_PLAN"]),
  deleteDietPlan
);

//diet plan items

adminRouter.get(
  "/get-diet-plan-items/:id",
  verifyToken,
  checkPermissions(["VIEW_DIET_ITEMS"]),
  viewDietPlanItem
);

adminRouter.get(
  "/get-diet-plan-items",
  verifyToken,
  checkPermissions(["VIEW_DIET_ITEMS"]),
  getAllDietPlanItems
);

adminRouter.post(
  "/create-diet-plan-item",
  verifyToken,
  checkPermissions(["CREATE_DIET_ITEM"]),
  createDietPlanItem
);

adminRouter.put(
  "/update-diet-plan-item/:id",
  verifyToken,
  checkPermissions(["MODIFY_DIET_ITEM"]),
  updateDietPlanItem
);

adminRouter.delete(
  "/delete-diet-plan-item/:id",
  verifyToken,
  checkPermissions(["DELETE_DIET_ITEM"]),
  deleteDietPlanItem
);

//product controller
adminRouter.post(
  "/create-product",
  verifyToken,
  checkPermissions(["CREATE_PRODUCT"]),
  createProduct
);
adminRouter.put(
  "/update-product/:id",
  verifyToken,
  checkPermissions(["MODIFY_PRODUCT"]),
  updateProduct
);
adminRouter.delete(
  "/delete-product/:id",
  verifyToken,
  checkPermissions(["DELETE_PRODUCT"]),
  deleteProduct
);
adminRouter.get(
  "/get-product/:id",
  verifyToken,
  checkPermissions(["VIEW_PRODUCTS"]),
  viewProduct
);
adminRouter.get(
  "/get-user-product",
  verifyToken,
  checkPermissions(["VIEW_PRODUCTS"]),
  viewProductsByUser
);
adminRouter.get(
  "/get-all-products",
  verifyToken,
  checkPermissions(["VIEW_PRODUCTS"]),
  getAllProducts
);

//order rotues

adminRouter.get(
  "/get-orders",
  verifyToken,
  checkPermissions(["VIEW_ORDERS"]),
  viewAllOrders
);
adminRouter.get(
  "/get-user-orders",
  verifyToken,
  checkPermissions(["VIEW_ORDERS"]),
  viewUserOrders
);

adminRouter.get(
  "/get-order/:id",
  verifyToken,
  checkPermissions(["VIEW_ORDERS"]),
  viewOrder
);
adminRouter.post(
  "/create-order",
  verifyToken,
  checkPermissions(["CREATE_ORDER"]),
  createOrder
);

adminRouter.put(
  "/update-order/:id",
  verifyToken,
  checkPermissions(["MODIFY_ORDER"]),
  updateOrder
);
adminRouter.delete(
  "/delete-order/:id",
  verifyToken,
  checkPermissions(["DELETE_ORDER"]),
  deleteOrder
);
//dashboard
adminRouter.get("/admin-dashboard", verifyToken, adminDashboard);
export default adminRouter;
