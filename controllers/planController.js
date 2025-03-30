import prisma from "../db/prismaClient.js";

import { date, z } from "zod";

const createWorkoutPlanSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  date: z.string().datetime(),
});

const updateWorkoutPlanSchema = z.object({
  date: z.string().datetime().optional(),
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
        date: parsedBody.date,
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
        date: parsedBody.date ? new Date(parsedBody.date) : workoutPlan.date,
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

//dietPlan

const createDietPlanSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  date: z.string().datetime(),
});

export const createDietPlan = async (req, res) => {
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = createDietPlanSchema.parse(body);

    // Create the diet plan
    const dietPlan = await prisma.dietPlan.create({
      data: {
        user_id: parsedBody.user_id,
        date: new Date(parsedBody.date),

        created_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      dietPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDietPlanSchema = z.object({
  date: z.string().datetime().optional(),
});

export const updateDietPlan = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = updateDietPlanSchema.parse(body);

    // Find the diet plan by ID
    const dietPlan = await prisma.dietPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    // Update the diet plan
    const updatedDietPlan = await prisma.dietPlan.update({
      where: { id: parseInt(id) },
      data: {
        date: parsedBody.date ? new Date(parsedBody.date) : dietPlan.date,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Diet plan updated successfully",
      dietPlan: updatedDietPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDietPlan = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the diet plan by ID
    const dietPlan = await prisma.dietPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    // Delete the diet plan
    await prisma.dietPlan.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewDietPlan = async (req, res) => {
  const { id } = req.params;

  try {
    const dietPlan = await prisma.dietPlan.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true, // Include related diet plan items
        user: true, // Include the user data if needed
      },
    });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      dietPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDietPlans = async (req, res) => {
  try {
    // Fetch all diet plans from the database
    const dietPlans = await prisma.dietPlan.findMany({
      include: {
        user: true, // Optionally include user details
        items: true, // Optionally include items associated with the diet plan
      },
    });

    return res.status(200).json({
      success: true,
      dietPlans,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//
