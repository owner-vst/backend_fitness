import { z } from "zod";
import { PrismaClient, BloodGroup, ActivityType, Goal } from "@prisma/client";

const prisma = new PrismaClient();

const updateUserSchema = z.object({
  // Fields for updating the User table
  // userId: z.number().min(1, { message: "User ID is required" }),
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Invalid email format" }).optional(), // Email is optional for update
  dob: z
    .string()
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid date of birth",
    })
    .optional(),
  gender: z
    .enum(["Male", "Female", "Other"], { message: "Invalid gender" })
    .optional(),
  profilePic: z.string().optional(),

  // Fields for updating the UserProfile table
  phone: z.string().min(1, { message: "Phone number is required" }).optional(),
  bloodGroup: z
    .enum(
      [
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
      ],
      {
        message: "Invalid blood group",
      }
    )
    .optional(),
  activityType: z
    .enum(["SPORTS_PERSON", "MODERATE", "LAZY", "ACTIVE"], {
      message: "Invalid activity type",
    })
    .optional(),
  goal: z
    .enum(["LOSE", "MAINTAIN", "GAIN"], {
      message: "Invalid goal",
    })
    .optional(),
  address: z.string().min(1, { message: "Address is required" }).optional(),
  height: z
    .number()
    .min(0, { message: "Height must be a positive number" })
    .optional(),
  weight: z
    .number()
    .min(0, { message: "Weight must be a positive number" })
    .optional(),
});

// Update or Create Profile API
export const updateUserProfile = async (req, res) => {
  try {
    // Parse and validate incoming data using Zod
    const {
      //  userId,
      firstName,
      lastName,
      email,
      dob,
      gender,
      profilePic,
      phone,
      bloodGroup,
      activityType,
      goal,
      address,
      height,
      weight,
    } = updateUserSchema.parse(req.body);
    const userId = req.userId;
    // Ensure the user exists in the User table
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Start a Prisma transaction to update both User and UserProfile tables
    const updateData = {};

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    updateData.name = `${firstName} ${lastName}`;
    if (email) updateData.email = email;
    if (dob) updateData.dob = new Date(dob);
    if (gender) updateData.gender = gender;
    if (profilePic) updateData.profilePic = profilePic;

    // Update the user table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Check if the user already has a profile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    let updatedProfile;

    if (existingProfile) {
      // Update the existing profile
      updatedProfile = await prisma.userProfile.update({
        where: { user_id: userId },
        data: {
          phone,
          blood_group: bloodGroup,
          activity_type: activityType,
          goal,
          address,
          height,
          weight,
          updated_at: new Date(),
        },
      });
    } else {
      // Create a new profile if not exists
      updatedProfile = await prisma.userProfile.create({
        data: {
          user_id: userId,
          phone,
          blood_group: bloodGroup,
          activity_type: activityType,
          goal,
          address,
          height,
          weight,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User and profile updated successfully",
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: errorMessages.join(", ") });
    }

    // Handle other errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the JWT token (authenticated user)
    const userId = req.userId;

    // Find the user's profile
    const user = await prisma.user.findUnique({
      where: {
        id: userId, // Use the user ID to find the profile
      },
      select: {
        id: true,
        name: true,
        first_name: true,
        last_name: true,
        email: true,
        dob: true,
        gender: true,
        profilePic: true,
        created_at: true,
      },
    });
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: userId, // Use the user ID to find the profile
      },
    });

    if (!userProfile) {
      return res.status(200).json({
        success: true,
        message: "User profile not found",
        profile: null,
        user:user
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      profile: userProfile,
      user: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user profile",
    });
  }
};
