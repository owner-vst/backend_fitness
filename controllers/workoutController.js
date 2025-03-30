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
  user_id: z.number().int(), // Added user_id
  plan_type: z.enum(["AI", "USER"]), // Example plan_type, adjust as needed
  date: z.string().datetime(), // Ensure the date is in a valid datetime format
  created_by_id: z.number().int(), // Added created_by_id
});
const UpdateWorkoutPlanItemSchema = z.object({
  workout_plan_id: z.number().int().optional(), // Optional, as it's not required to update
  activity_id: z.number().int().optional(), // Optional, as it's not required to update
  duration: z.number().int().optional(), // Optional, as it's not required to update
  status: z.enum(["PENDING", "COMPLETED", "SKIPPED"]).optional(), // Optional, as it's not required to update
  user_id: z.number().int().optional(), // Optional, as it's not required to update
  plan_type: z.enum(["AI", "USER"]).optional(), // Optional, as it's not required to update
  date: z.string().datetime().optional(), // Optional, as it's not required to update
  created_by_id: z.number().int().optional(), // Optional, as created_by_id typically should not be updated
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
        user_id: parsedBody.user_id, // Added user_id
        plan_type: parsedBody.plan_type, // Added plan_type
        date: parsedBody.date, // Added date
        created_by_id: parsedBody.created_by_id, // Assuming user is authenticated and their ID is stored in `req.user.id`
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
        user: true, // Include user details
        created_by: true, // Include the user who created this item
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
        user: true, // Include user details
        created_by: true, // Include the user who created this item
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
    const parsedBody = UpdateWorkoutPlanItemSchema.parse(req.body);

    // Update the workout plan item
    const updatedWorkoutPlanItem = await prisma.workoutPlanItem.update({
      where: { id: parseInt(id) },
      data: {
        workout_plan_id: parsedBody.workout_plan_id,
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: parsedBody.status,
        user_id: parsedBody.user_id, // Updated user_id
        plan_type: parsedBody.plan_type, // Updated plan_type
        date: parsedBody.date, // Updated date
        created_by_id: parsedBody.created_by_id, // Assuming user is authenticated and their ID is stored in `req.user.id`
        // created_by_id is not updated; it's immutable
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
