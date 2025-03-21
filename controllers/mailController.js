import nodemailer from 'nodemailer';
import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
} from "../utils/mailTemplate.js";

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io', // Use your SMTP host
	port: 587, // Use the appropriate port
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const sender = 'no-reply@yourdomain.com'; // Replace with your sender email

export const sendVerificationEmail = async (email, verificationToken) => {
	const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${verificationToken}&email=${email}`;
	const message = {
		from: sender,
		to: email,
		subject: "Verify your email",
		html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken, "{verificationUrl}", verificationUrl),
	};

	try {
		await transporter.sendMail(message);
		console.log("Verification email sent successfully ", verificationToken);
	} catch (error) {
		console.error(`Error sending verification email`, error);
		throw new Error(`Error sending verification email: ${error.message}`);
	}
};

export const sendWelcomeEmail = async (email, name) => {
	const message = {
		from: sender,
		to: email,
		subject: "Welcome to Auth Company",
		html: `<p>Welcome, ${name}! Thank you for joining Auth Company.</p>`,
	};

	try {
		await transporter.sendMail(message);
		console.log("Welcome email sent successfully");
	} catch (error) {
		console.error(`Error sending welcome email`, error);
		throw new Error(`Error sending welcome email: ${error.message}`);
	}
};

export const sendPasswordResetEmail = async (email, resetURL) => {
	const message = {
		from: sender,
		to: email,
		subject: "Reset your password",
		html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
	};

	try {
		await transporter.sendMail(message);
		console.log("Password reset email sent successfully");
	} catch (error) {
		console.error(`Error sending password reset email`, error);
		throw new Error(`Error sending password reset email: ${error.message}`);
	}
};

export const sendResetSuccessEmail = async (email) => {
	const message = {
		from: sender,
		to: email,
		subject: "Password Reset Successful",
		html: PASSWORD_RESET_SUCCESS_TEMPLATE,
	};

	try {
		await transporter.sendMail(message);
		console.log("Password reset success email sent successfully");
	} catch (error) {
		console.error(`Error sending password reset success email`, error);
		throw new Error(`Error sending password reset success email: ${error.message}`);
	}
};

export const sendOtpEmail = async (email, otp) => {
	const message = {
		from: sender,
		to: email,
		subject: "Your OTP for Insightstracker",
		html: `<p>Your OTP is ${otp}. It will expire in 5 minutes.</p>`,
	};

	try {
		await transporter.sendMail(message);
		console.log("OTP email sent successfully");
	} catch (error) {
		console.error(`Error sending OTP email`, error);
		throw new Error(`Error sending OTP email: ${error.message}`);
	}
};