import express from "express";
import { Me } from "../utils/Me.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const commonRouter = express.Router();
commonRouter.get("/me", verifyToken,Me );
export default commonRouter;
