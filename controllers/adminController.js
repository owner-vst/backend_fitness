import bcryptjs from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import {
  sendUserCreatedEMail,
  sendVerificationEmail,
} from "./mailController.js";

import prisma from "../db/prismaClient.js";
const signupSchemaAdmin = z.object({
  email: z.string().email(), // Validate email format
  //password: z.string().min(8), // Password must be at least 8 characters
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  gender: z.enum(["Male", "Female", "Other"]), // Assuming fixed gender values
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }), // Validate date format
  //phone: z.string().min(10).max(15), // Validate phone length

  profilePic: z.string().url(),
  role_name: z.enum(["USER", "ADMIN", "VENDOR"]), // Role validation (can be extended based on your needs)
});

export const createUsers = async (req, res) => {
  let body;
  try {
    body = await req.body;

    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }
    const parsedBody = signupSchemaAdmin.parse(body);

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email: parsedBody.email },
    });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    let password = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const role = await prisma.role.findFirst({
      where: {
        role_name: parsedBody.role_name, // Match role by name
      },
    });

    if (!role) {
      return res.json({ message: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: `${parsedBody.firstname} ${parsedBody.lastname}`,
        email: parsedBody.email,
        password_hash: hashedPassword, // Store hashed password
        first_name: parsedBody.firstname,
        last_name: parsedBody.lastname,
        gender: parsedBody.gender,
        dob: new Date(parsedBody.dob), // Convert string date to Date object

        created_at: new Date(),
        updated_at: new Date(),
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        profilePic: parsedBody.profilePic || "", // Optional, if not provided, use empty string
        role_id: role.id, // Associate user with role using role ID

        status: "ACTIVE", // Set default verified status to false
      },
    });

    // jwt
    //generateTokenAndSetCookie(res, user.id);
    await sendUserCreatedEMail(user.email, password);
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

// Modify User Function (userId in URL params)
export const modifyUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId); // Get userId from URL params
    const body = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required in the URL" });
    }

    // Parse the body using the schema
    const parsedBody = signupSchemaAdmin.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: parsedBody.email,
        name: `${parsedBody.firstname} ${parsedBody.lastname}`,
        first_name: parsedBody.firstname,
        last_name: parsedBody.lastname,
        gender: parsedBody.gender,
        dob: new Date(parsedBody.dob),
        profilePic: parsedBody.profilePic || existingUser.profilePic, // Keep existing profile pic if not provided
        role_id:
          (
            await prisma.role.findFirst({
              where: { role_name: parsedBody.role_name },
            })
          )?.id || existingUser.role_id, // Keep existing role if not provided
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        ...updatedUser,
        password_hash: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete User Function (userId in URL params)
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId); // Get userId from URL params

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required in the URL" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Set user status to INACTIVE instead of hard-deleting
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "INACTIVE", // Mark as inactive instead of deleting
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully (status set to INACTIVE)",
      user: {
        ...updatedUser,
        password_hash: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        gender: true,
        dob: true,
        profilePic: true,
        role: {
          select: {
            role_name: true,
          },
        },
      },
    });
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const getUserById = async (req, res) => {
  const userId = parseInt(req.params.userId); // Get the user ID from the request parameters

  // Check if the ID is a valid integer
  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Ensure that the ID is parsed as an integer
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        gender: true,
        dob: true,
        profilePic: true,
        role: {
          select: {
            role_name: true,
          },
        },
      },
    });

    // If no user is found with the given ID
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const adminDashboard = async (req, res) => {
  try {
    // Get the total number of Users
    const totalUsers = await prisma.user.count();

    // Get the total number of Vendors
    const totalVendors = await prisma.user.count({
      where: { role: { role_name: "VENDOR" } },
    });

    // Get the total number of Products
    const totalProducts = await prisma.product.count();

    // Get the total number of Activities
    const totalActivities = await prisma.activity.count();

    // Get the total number of Food Items
    const totalFoodItems = await prisma.foodCatalogue.count();

    // Get the total calories burned by all users
    const totalCaloriesBurned = await prisma.dailyProgress.aggregate({
      _sum: {
        calories_burned: true,
      },
    });
    const totalCaloriesBurnedUser = await prisma.dailyProgress.aggregate({
      where: {
        user_id: req.userId,
      },
      _sum: {
        calories_burned: true,
      },
    });

    // Get the number of Diet Programs
    const totalUserDietPrograms = await prisma.dietPlan.count({
      where: {
        user_id: req.userId,
      },
    });

    // Get the number of Workout Programs
    const totalUserWorkoutPrograms = await prisma.workoutPlan.count({
      where: {
        user_id: req.userId,
      },
    });

    // Get the total sales (from orders)
    const totalSales = await prisma.order.aggregate({
      _sum: {
        total_price: true,
      },
      where: {
        status: "DELIVERED",
      },
    });
    const totalSalesCount = await prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    });
    const userDietPlans = await prisma.dietPlan.count({
      where: {
        user_id: req.userId, // Replace with the specific user's ID
      },
    });
    const userWorkoutPlans = await prisma.workoutPlan.count({
      where: {
        user_id: req.userId, // Replace with the specific user's ID
      },
    });
    // Get weekly progress (Last 7 days)
    const weeklyProgress = await prisma.dailyProgress.aggregate({
      _sum: {
        calories_burned: true,
        steps_count: true,
        water_intake: true,
      },
      where: {
        user_id: req.userId,
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    });
    return res.status(200).json({
      success: true,
      totalUsers,
      totalVendors,
      totalProducts,
      totalActivities,
      totalFoodItems,
      totalCaloriesBurned,
      totalUserDietPrograms,
      totalUserWorkoutPrograms,
      totalSales,
      weeklyProgress,
      totalCaloriesBurnedUser,
      totalSalesCount,
      userDietPlans,
      userWorkoutPlans,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
