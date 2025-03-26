import prisma from "../db/prismaClient.js";
import { z } from "zod";

export const createActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"), // Ensures the name is a non-empty string
  duration: z.number().min(1, "Duration must be at least 1 hour"), // Ensures duration is at least 1 hour
  calories_per_kg: z
    .number()
    .min(0, "Calories per kg must be a positive number"), // Positive value for calories
  user_id: z.number().optional(), // Optional, in case the activity isn't associated with a specific user
});

export const createActivity = async (req, res) => {
  let body;
  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createActivitySchema.parse(body); // Zod schema validation

    // Step 2: Check if Activity already exists
    const activityExists = await prisma.activity.findUnique({
      where: { name: parsedBody.name },
    });

    if (activityExists) {
      return res.status(400).json({
        success: false,
        message: "Activity with this name already exists",
      });
    }

    // Step 3: Create Activity in the database
    const activity = await prisma.activity.create({
      data: {
        name: parsedBody.name,
        duration: parsedBody.duration, // Duration in hours (e.g., 1 hour)
        calories_per_kg: parsedBody.calories_per_kg, // Calories burned per kg per hour
        user_id: parsedBody.user_id || null, // Optional user, can be null
      },
    });

    // Step 4: Return success response
    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const modifyActivity = async (req, res) => {
  let body;
  const activityId = parseInt(req.params.activityId); // Get the activity ID from the URL params

  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createActivitySchema.parse(body); // Zod schema validation

    // Step 2: Check if Activity exists by ID
    const activityExists = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activityExists) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Step 3: Update the Activity in the database
    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(activityId) }, // Use the ID from the URL params to find the activity
      data: {
        name: parsedBody.name || activityExists.name, // Only update the name if provided
        duration: parsedBody.duration || activityExists.duration, // Only update if duration is provided
        calories_per_kg:
          parsedBody.calories_per_kg || activityExists.calories_per_kg, // Only update if calories_per_kg is provided
        user_id: parsedBody.user_id || activityExists.user_id, // If no user_id, keep the existing one
      },
    });

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  const activityId = parseInt(req.params.activityId); // Get the activity ID from the URL params

  try {
    // Step 1: Validate the ID (check if it's a valid number)
    // Convert the ID to an integer
    if (isNaN(activityId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid activity ID" });
    }

    // Step 2: Check if Activity exists by ID
    const activityExists = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activityExists) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Step 3: Delete the Activity from the database
    await prisma.activity.delete({
      where: { id: activityId },
    });

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const getAllActivities = async (req, res) => {
  try {
    // Step 1: Fetch all activities from the database
    const activities = await prisma.activity.findMany();

    // Step 2: Check if there are no activities
    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found",
      });
    }

    // Step 3: Return all activities
    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    // Step 4: Handle any errors
    return res.status(400).json({ success: false, message: error.message });
  }
};

const workoutPlanItemSchema = z.object({
  workout_plan_id: z.number().int(),
  activity_id: z.number().int(),
  duration: z.number().int(),
  status: z.enum(["PENDING", "COMPLETED", "SKIPPED"]),
});

export const createWorkoutPlanItem = async (req, res) => {
  try {
    // Validate the request body
    const parsedBody = workoutPlanItemSchema.parse(req.body);

    // Create a new workout plan item
    const workoutPlanItem = await prisma.workoutPlanItem.create({
      data: {
        workout_plan_id: parsedBody.workout_plan_id,
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: parsedBody.status,
      },
    });

    res.status(201).json({
      success: true,
      workoutPlanItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWorkoutPlanItem = async (req, res) => {
  const { id } = req.params; // Get the workout plan item ID from the URL params
  try {
    // Fetch the workout plan item by its ID
    const workoutPlanItem = await prisma.workoutPlanItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        workout_plan: true, // Include workout plan details
        activity: true, // Include activity details
      },
    });

    if (!workoutPlanItem) {
      return res.status(404).json({
        success: false,
        message: "Workout plan item not found",
      });
    }

    res.status(200).json({
      success: true,
      workoutPlanItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllWorkoutPlanItems = async (req, res) => {
  try {
    // Fetch all workout plan items from the database
    const workoutPlanItems = await prisma.workoutPlanItem.findMany({
      include: {
        workout_plan: true, // Include workout plan details
        activity: true, // Include activity details
      },
    });

    res.status(200).json({
      success: true,
      workoutPlanItems,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWorkoutPlanItem = async (req, res) => {
  const { id } = req.params; // Get the workout plan item ID from the URL params
  try {
    // Validate the request body
    const parsedBody = workoutPlanItemSchema.parse(req.body);

    // Update the workout plan item
    const updatedWorkoutPlanItem = await prisma.workoutPlanItem.update({
      where: { id: parseInt(id) },
      data: {
        workout_plan_id: parsedBody.workout_plan_id,
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: parsedBody.status,
      },
    });

    res.status(200).json({
      success: true,
      updatedWorkoutPlanItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteWorkoutPlanItem = async (req, res) => {
  const { id } = req.params; // Get the workout plan item ID from the URL params
  try {
    // Delete the workout plan item
    const deletedWorkoutPlanItem = await prisma.workoutPlanItem.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Workout plan item deleted successfully",
      deletedWorkoutPlanItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createWorkoutLogSchema = z.object({
  user_id: z.number().int().positive(),
  activity_id: z.number().int().positive(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  duration: z.number().int().positive(),
  status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]),
});

export const createWorkoutLog = async (req, res) => {
  try {
    // Validate request body with Zod schema
    const validatedBody = createWorkoutLogSchema.parse(req.body);

    const { user_id, activity_id, date, duration, status } = validatedBody;

    const workoutLog = await prisma.workoutLog.create({
      data: {
        user_id,
        activity_id,
        date: new Date(date),
        duration,
        status,
      },
    });

    res.status(201).json({ success: true, workoutLog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWorkoutLogSchema = z.object({
  user_id: z.number().int().positive().optional(),
  activity_id: z.number().int().positive().optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]).optional(),
});

export const updateWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate request body with Zod schema
    const validatedBody = updateWorkoutLogSchema.parse(req.body);

    const workoutLog = await prisma.workoutLog.update({
      where: { id: parseInt(id) },
      data: validatedBody, // Only update the fields that were provided
    });

    res.status(200).json({ success: true, workoutLog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkoutLogSchema = z.object({
  id: z.number().int().positive(),
});

export const getWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID parameter with Zod schema
    getWorkoutLogSchema.parse({ id: parseInt(id) });

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workoutLog) {
      return res
        .status(404)
        .json({ success: false, message: "Workout log not found" });
    }

    res.status(200).json({ success: true, workoutLog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllWorkoutLogs = async (req, res) => {
  try {
    // Fetch all workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      include: {
        user: true, // Include user details if needed
        activity: true, // Include activity details if needed
      },
    });

    res.status(200).json({ success: true, workoutLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID parameter with Zod schema
    getWorkoutLogSchema.parse({ id: parseInt(id) });

    await prisma.workoutLog.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({ success: true, message: "Workout Log deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getWorkoutLogsByUser = async (req, res) => {
  const { userId } = req.userId;

  try {
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        user: true, // Include user details if needed
        activity: true, // Include activity details if needed
      },
    });

    res.status(200).json({ success: true, workoutLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
