import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	verifyOtp,
} from "../controllers/authControllers.js";
import { checkPermissions, verifyToken } from "../middlewares/verifyToken.js";

const authRouter = express.Router();

authRouter.get("/check-auth", verifyToken, checkAuth);

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/verify-otp", verifyOtp);

authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password/:token", resetPassword);

authRouter.post('/manage-users', verifyToken, checkPermissions(['CREATE_PRODUCT']), (req, res) => {
    res.send('Admin can manage users');
});

export default authRouter;