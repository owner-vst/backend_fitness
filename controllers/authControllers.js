import bcryptjs from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendOtpEmail,
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "./mailController.js";
import { generateOtp } from "../utils/otpUtils.js";

const prisma = new PrismaClient();

// Define Zod schemas for validation
const signupSchema = z.object({
	email: z.string().email(), // Validate email format
	password: z.string().min(8), // Password must be at least 8 characters
	firstname: z.string().min(1),
	lastname: z.string().min(1),
	gender: z.enum(['Male', 'Female', 'Other']), // Assuming fixed gender values
	dob: z.string().refine(val => !isNaN(Date.parse(val)), {
		message: 'Invalid date',
	}), // Validate date format
	//phone: z.string().min(10).max(15), // Validate phone length
	
	profilePic: z.string().url(),
	//role: z.enum(['user', 'admin', 'vendor']), // Role validation (can be extended based on your needs)
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

const verifyEmailSchema = z.object({
	code: z.string().min(6).max(6), // Assuming 6-digit verification code
});

const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

const resetPasswordSchema = z.object({
	password: z.string().min(8),
});

export const signup = async (req, res) => {
	try {
		const parsedBody = signupSchema.parse(req.body);
		const { email, password, firstname, lastname, gender, dob,  profilePic} = parsedBody;

		const userAlreadyExists = await prisma.user.findUnique({
			where: { email },
		});

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = await prisma.user.create({
			data: {
				email,
				password_hash: hashedPassword,
				name: `${firstname} ${lastname}`,
				gender,
				dob: new Date(dob),
				profilePic,
				role_id: 1,
				verificationToken,
				created_at: new Date(),
				updated_at: new Date(),
				verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			},
		});

		// jwt
		generateTokenAndSetCookie(res, user.id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user,
				password_hash: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const parsedBody = verifyEmailSchema.parse(req.body);
		const { code } = parsedBody;

		const user = await prisma.user.findFirst({
			where: {
				verificationToken: code,
				verificationTokenExpiresAt: { gt: new Date() },
			},
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				isVerified: true,
				verificationToken: null,
				verificationTokenExpiresAt: null,
			},
		});

		await sendWelcomeEmail(user.email, user.firstname);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user,
				password_hash: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	try {
		const parsedBody = loginSchema.parse(req.body);
		const { email, password } = parsedBody;

		const user = await prisma.user.findUnique({
			where: { email },
		});
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		//generateTokenAndSetCookie(res, user.id);

		// await prisma.user.update({
		// 	where: { id: user.id },
		// 	data: { lastLogin: new Date() },
		// });
		const otp = generateOtp();
		await prisma.user.update({
		  where: { id: user.id },
		  data: {
			otp,
			otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
		  },
		});
  
		// Send OTP to user email
		await sendOtpEmail(user.email, otp);
  
		res.status(200).json({
			success: true,
			message: "OTP sent to your email",
			needsOtp: true, // Notify the frontend that OTP is required
			userId: user.id, // Send user ID so the frontend can send it back when submitting OTP
			
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	try {
		const parsedBody = forgotPasswordSchema.parse(req.body);
		const { email } = parsedBody;

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetPasswordExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

		await prisma.user.update({
			where: { id: user.id },
			data: {
				resetPasswordToken: resetToken,
				resetPasswordExpiresAt,
			},
		});

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
		console.log("token", resetToken);
		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		console.log("token", token);
		const parsedBody = resetPasswordSchema.parse(req.body);
		const { password } = parsedBody;

		const user = await prisma.user.findFirst({
			where: {
				resetPasswordToken: token,
				resetPasswordExpiresAt: { gt: new Date() },
			},
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				password_hash: hashedPassword,
				resetPasswordToken: null,
				resetPasswordExpiresAt: null,
			},
		});

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			select: {
				id: true,
				email: true,
				name: true,
				isVerified: true,
				//lastLogin: true,
				// Add other fields you want to include
			},
		});
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyOtp = async (req, res) => {
	try {
	  const { otp, userId } = req.body;
	  const user = await prisma.user.findUnique({
		where: { id: userId, otp },
	  });
	
	  const role = await prisma.role.findUnique({
		where: { id: user.role_id },
	  })
	  if (!user || user.otpExpiresAt < new Date()) {
		return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
	  }
  
	  // OTP is valid, generate JWT token
	  const token = generateTokenAndSetCookie(res, user.id);
  
	  // Clear OTP data
	  await prisma.user.update({
		where: { id: user.id },
		data: {
		  otp: null,
		  otpExpiresAt: null,
		},
	  });
  
	  res.status(200).json({
		success: true,
		message: "OTP verified successfully",
		role:role.role_name,
		user:{...user, password_hash: undefined},
		 // Send the user object in the response
		token, // Send the JWT token in the response
	  });
	} catch (err) {
	  console.error("Otp Verification error ",err);
	  res.status(500).json({ success: false, message: "Server error" });
	}
  };
  

  