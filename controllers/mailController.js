import nodemailer from "nodemailer";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_OTP_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../utils/mailTemplate.js";

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "mail.akg7547.uta.cloud", // Use your SMTP host
  port: 465, // Use the appropriate port
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sender = "no-reply@yourdomain.com"; // Replace with your sender email

export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/auth/verify?token=${verificationToken}&email=${email}`;
  const message = {
    from: sender,
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken,
      "{verificationUrl}",
      verificationUrl
    ),
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
    subject: "Welcome to Insightstracker",
    html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
  };

  try {
    await transporter.sendMail(message);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const message = {
    from: sender,
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetToken}", resetToken),
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
    throw new Error(
      `Error sending password reset success email: ${error.message}`
    );
  }
};

export const sendOtpEmail = async (email, otp) => {
  const message = {
    from: sender,
    to: email,
    subject: "Your OTP for Insightstracker",
    html: VERIFICATION_EMAIL_OTP_TEMPLATE.replace("{otp}", otp),
  };

  try {
    await transporter.sendMail(message);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error(`Error sending OTP email`, error);
    throw new Error(`Error sending OTP email: ${error.message}`);
  }
};

export const sendUserCreatedEMail = async (email, password) => {
  const message = {
    from: sender,
    to: email,
    subject: "Your account created for Insightstracker",
    html: `<p>Your password is ${password}. It will expire in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(message);
    console.log("user created email sent successfully ", password);
  } catch (error) {
    console.error(`Error sending user created email`, error);
    throw new Error(`Error sending user created email: ${error.message}`);
  }
};
