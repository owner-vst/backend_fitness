import prisma from "../db/prismaClient.js";

import { z } from "zod";

const createWorkoutPlanSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

const updateWorkoutPlanSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const createWorkoutPlan = async (req, res) => {
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = createWorkoutPlanSchema.parse(body);

    // Create the workout plan
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        user_id: parsedBody.user_id,
        start_date: new Date(parsedBody.start_date),
        end_date: new Date(parsedBody.end_date),
        created_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workout plan created successfully",
      workoutPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWorkoutPlan = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = updateWorkoutPlanSchema.parse(body);

    // Find the workout plan by ID
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    // Update the workout plan
    const updatedWorkoutPlan = await prisma.workoutPlan.update({
      where: { id: parseInt(id) },
      data: {
        start_date: parsedBody.start_date
          ? new Date(parsedBody.start_date)
          : workoutPlan.start_date,
        end_date: parsedBody.end_date
          ? new Date(parsedBody.end_date)
          : workoutPlan.end_date,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Workout plan updated successfully",
      workoutPlan: updatedWorkoutPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteWorkoutPlan = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the workout plan by ID
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    // Delete the workout plan
    await prisma.workoutPlan.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewWorkoutPlan = async (req, res) => {
  const { id } = req.params;

  try {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true, // Include related workout plan items
        user: true, // Include the user data if needed
      },
    });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      workoutPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllWorkoutPlans = async (req, res) => {
  try {
    // Fetch all workout plans from the database
    const workoutPlans = await prisma.workoutPlan.findMany({
      include: {
        user: true, // Optionally include user details
        items: true, // Optionally include items associated with the workout plan
      },
    });

    return res.status(200).json({
      success: true,
      workoutPlans,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
