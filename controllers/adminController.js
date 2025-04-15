import bcryptjs from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import {
  sendUserCreatedEMail,
  sendVerificationEmail,
} from "./mailController.js";

import prisma from "../db/prismaClient.js";
export const signupSchemaAdmin = z.object({
  email: z.string().email(),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  profilePic: z.string().url().optional(),

  // Role matches RoleType enum
  role_name: z.enum(["ADMIN", "USER", "VENDOR"]),

  // UserProfile fields with correct enum values
  height: z.coerce
    .number()
    .min(1, { message: "Height must be a positive number" }),
  weight: z.coerce
    .number()
    .min(1, { message: "Weight must be a positive number" }),
  blood_group: z.enum([
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
  ]),
  activity_type: z.enum(["MODERATE", "LAZY", "ACTIVE", "SPORTS_PERSON"]),
  goal: z.enum(["GAIN", "LOSE", "MAINTAIN"]),
  address: z.string().min(5),
  phone: z.string().min(10).max(15),
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
        isVerified: true,

        status: "ACTIVE", // Set default verified status to false
      },
    });

    // jwt
    //generateTokenAndSetCookie(res, user.id);
    await sendUserCreatedEMail(user.email, password);
    //await sendVerificationEmail(user.email, verificationToken);

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
        status: true,
      },
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    const formattedData = users.map((user) => {
      return {
        id: user.id,

        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        dob: user.dob.toISOString().split("T")[0],
        profilePic: user.profilePic,
        role: user.role.role_name,
        status: user.status,
      };
    });

    return res.status(200).json({ success: true, users: formattedData });
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
export const getUSerNameList = async (req, res) => {
  try {
    const userNameList = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).json({
      success: true,
      userNameList,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getVendorsAdminList = async (req, res) => {
  try {
    const vendors = await prisma.user.findMany({
      where: {
        role: { role_name: "VENDOR" },
        or: [{ role: { role_name: "ADMIN" } }],
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      success: true,
      vendors,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const adminCreateUsers = async (req, res) => {
  try {
    const body = await req.body;

    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = signupSchemaAdmin.parse(body);

    const requiredProfileFields = [
      "height",
      "weight",
      "blood_group",
      "activity_type",
      "goal",
      "address",
      "phone",
    ];

    for (const field of requiredProfileFields) {
      if (
        parsedBody[field] === undefined ||
        parsedBody[field] === null ||
        parsedBody[field] === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

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
        role_name: parsedBody.role_name,
      },
    });

    if (!role) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await prisma.user.create({
      data: {
        name: `${parsedBody.firstname} ${parsedBody.lastname}`,
        email: parsedBody.email,
        password_hash: hashedPassword,
        first_name: parsedBody.firstname,
        last_name: parsedBody.lastname,
        gender: parsedBody.gender,
        dob: new Date(parsedBody.dob),
        created_at: new Date(),
        updated_at: new Date(),
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        profilePic: parsedBody.profilePic || "",
        role_id: role.id,
        isVerified: true,
        status: "ACTIVE",
        UserProfile: {
          create: {
            height: parseFloat(parsedBody.height),
            weight: parseFloat(parsedBody.weight),
            blood_group: parsedBody.blood_group,
            activity_type: parsedBody.activity_type,
            goal: parsedBody.goal,
            address: parsedBody.address,
            phone: parsedBody.phone,
          },
        },
      },
    });

    await sendUserCreatedEMail(user.email, password);

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

export const adminModifyUsers = async (req, res) => {
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
      include: { UserProfile: true }, // Include UserProfile in the query
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
        UserProfile: {
          upsert: {
            where: { user_id: userId },
            update: {
              height: parsedBody.height,
              weight: parsedBody.weight,
              blood_group: parsedBody.blood_group,
              activity_type: parsedBody.activity_type,
              goal: parsedBody.goal,
              address: parsedBody.address,
              phone: parsedBody.phone,
              updated_at: new Date(),
            },
            create: {
              height: parsedBody.height,
              weight: parsedBody.weight,
              blood_group: parsedBody.blood_group,
              activity_type: parsedBody.activity_type,
              goal: parsedBody.goal,
              address: parsedBody.address,
              phone: parsedBody.phone,
            },
          },
        },
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

export const getUsersDetails = async (req, res) => {
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
        status: true,
        role: {
          select: {
            role_name: true,
          },
        },
        UserProfile: {
          select: {
            height: true,
            weight: true,
            blood_group: true,
            activity_type: true,
            goal: true,
            address: true,
            phone: true,
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

    const formattedData = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        dob: user.dob.toISOString().split("T")[0],
        profilePic: user.profilePic,
        status: user.status,
        role: user.role.role_name,
        height: user.UserProfile?.height ?? null,
        weight: user.UserProfile?.weight ?? null,
        blood_group: user.UserProfile?.blood_group ?? null,
        activity_type: user.UserProfile?.activity_type ?? null,
        goal: user.UserProfile?.goal ?? null,
        address: user.UserProfile?.address ?? null,
        phone: user.UserProfile?.phone ?? null,
      };
    });

    return res.status(200).json({ success: true, users: formattedData });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const demodeleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Optional: Check if the user exists first
    const user = await prisma.user.findUnique({
      where: { id: 13 },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // This will automatically delete the profile if cascade is set up
    // await prisma.userProfile.delete({
    //   where: { user_id: 13 },
    // });

    await prisma.user.delete({
      where: { id: 13 },
    });
    return res.status(200).json({
      success: true,
      message: "User and profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
