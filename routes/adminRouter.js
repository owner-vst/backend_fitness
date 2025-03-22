import express from "express";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";
import { createUsers, deleteUser, modifyUser } from "../controllers/adminController.js";

const adminRouter = express.Router();
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

export default adminRouter;
