import { z } from "zod";
import { PrismaClient, BloodGroup, ActivityType, Goal } from "@prisma/client";

const prisma = new PrismaClient();

// Schema for creating a profile
const createProfileSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  height: z.number().positive("Height must be a positive number"),
  weight: z.number().positive("Weight must be a positive number"),
  blood_group: z.enum([
    BloodGroup.A_POSITIVE,
    BloodGroup.A_NEGATIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.B_NEGATIVE,
    BloodGroup.O_POSITIVE,
    BloodGroup.O_NEGATIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.AB_NEGATIVE,
  ]), // BloodGroup enum values
  activity_type: z.enum([
    ActivityType.MODERATE,
    ActivityType.LAZY,
    ActivityType.ACTIVE,
    ActivityType.SPORTS_PERSON,
  ]), // ActivityType enum values
  goal: z.enum([Goal.GAIN, Goal.LOSE, Goal.MAINTAIN]), // Goal enum values
});

export const createProfile = async (req, res) => {
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = createProfileSchema.parse(body);

    // Create a new user profile
    const userProfile = await prisma.userProfile.create({
      data: {
        user_id: parsedBody.user_id,
        height: parsedBody.height,
        weight: parsedBody.weight,
        blood_group: parsedBody.blood_group,
        activity_type: parsedBody.activity_type,
        goal: parsedBody.goal,
        updated_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      userProfile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Schema for updating a profile
const updateProfileSchema = z.object({
  height: z.number().positive("Height must be a positive number").optional(),
  weight: z.number().positive("Weight must be a positive number").optional(),
  blood_group: z
    .enum([
      BloodGroup.A_POSITIVE,
      BloodGroup.A_NEGATIVE,
      BloodGroup.B_POSITIVE,
      BloodGroup.B_NEGATIVE,
      BloodGroup.O_POSITIVE,
      BloodGroup.O_NEGATIVE,
      BloodGroup.AB_POSITIVE,
      BloodGroup.AB_NEGATIVE,
    ])
    .optional(),
  activity_type: z
    .enum([
      ActivityType.MODERATE,
      ActivityType.LAZY,
      ActivityType.ACTIVE,
      ActivityType.SPORTS_PERSON,
    ])
    .optional(),
  goal: z.enum([Goal.GAIN, Goal.LOSE, Goal.MAINTAIN]).optional(),
});

export const updateProfile = async (req, res) => {
  const { id } = req.params; // ID of the user profile to update
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = updateProfileSchema.parse(body);

    // Find the user profile by user_id
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: parseInt(id) },
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Update the profile
    const updatedProfile = await prisma.userProfile.update({
      where: { user_id: parseInt(id) },
      data: {
        height: parsedBody.height ?? userProfile.height,
        weight: parsedBody.weight ?? userProfile.weight,
        blood_group: parsedBody.blood_group ?? userProfile.blood_group,
        activity_type: parsedBody.activity_type ?? userProfile.activity_type,
        goal: parsedBody.goal ?? userProfile.goal,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userProfile: updatedProfile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the JWT token (authenticated user)
    const userId = req.userId;

    // Find the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: userId, // Use the user ID to find the profile
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      profile: userProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user profile",
    });
  }
};
