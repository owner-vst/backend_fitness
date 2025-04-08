import prisma from "../db/prismaClient.js";
import { z } from "zod";

import { getOrCreateDietPlan } from "./dietController.js";
import { getOrCreateWorkoutPlan } from "./workoutController.js";

// export const getUserWorkoutPlanItems = async (req, res) => {
//   const userId = req.userId; // Assume user ID is available from the authenticated request
//   const { date } = req.query; // Get the date from the query params

//   try {
//     if (!date) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Date is required" });
//     }

//     const requestedDate = new Date(date);
//     if (isNaN(requestedDate)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid date format" });
//     }
//     const normalizedRequestedDate = new Date(
//       requestedDate.setHours(0, 0, 0, 0)
//     );

//     // Get the end of the day for comparison (just before midnight)
//     const normalizedEndDate = new Date(
//       normalizedRequestedDate.getTime() + 24 * 60 * 60 * 1000 - 1
//     );

//     console.log("Normalized Requested Date:", normalizedRequestedDate);
//     console.log("requestedDate:", requestedDate);

//     const userProfile = await prisma.userProfile.findUnique({
//       where: { user_id: userId },
//       select: { weight: true },
//     });

//     if (!userProfile) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User profile not found" });
//     }

//     const workoutPlanItems = await prisma.workoutPlanItem.findMany({
//       where: {
//         workout_plan: {
//           user: { id: userId },
//           date: {
//             gte: normalizedRequestedDate, // Start of the requested day
//             lte: normalizedEndDate, // End of the requested day
//           },
//         },
//       },
//       include: {
//         activity: {
//           select: {
//             id: true,
//             name: true,
//             calories_per_kg: true,
//             duration: true,
//           },
//         },
//         workout_plan: {
//           select: { date: true },
//         },
//       },
//     });

//     if (workoutPlanItems.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No workout plans found for the given date",
//       });
//     }

//     const result = workoutPlanItems.map((item) => {
//       const caloriesPerMinute = item.activity.calories_per_kg / 60;
//       const caloriesBurned =
//         userProfile.weight * caloriesPerMinute * item.duration;

//       return {
//         planItemId: item.id,
//         activityName: item.activity.name,
//         caloriesBurned: caloriesBurned,
//         status: item.status,
//         duration: item.duration,
//       };
//     });

//     res.status(200).json({ success: true, workoutPlanItems: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
export const getUserWorkoutPlanItems = async (req, res) => {
  const userId = req.userId; // Assume user ID is available from the authenticated request
  const { date } = req.query; // Get the date from the query params
  const requestedDate = new Date(date);
  const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
  // Get the end of the day (23:59:59.999)
  const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));
  console.log("Start of day:", startOfDay);
  console.log("End of day:", endOfDay);
  const workoutPlans = await prisma.workoutPlan.findMany({
    where: {
      user_id: userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      items: {
        select: {
          id: true,
          status: true,
          duration: true,
          activity: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const mappedWorkoutPlans = workoutPlans.map((plan) => ({
    ...plan,
    items: plan.items.map((item) => ({
      id: item.id,
      status: item.status,
      duration: item.duration,
      activity: item.activity.name,
    })),
  }));

  return res
    .status(200)
    .json({ success: true, workoutPlans: mappedWorkoutPlans });
};
const UpdateDietPlanSchema = z.object({
  planItemId: z.number(),
  duration: z.number(),
  status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]),
});
export const updateUserWorkoutPlanItems = async (req, res) => {
  try {
    const { planItemId, status, duration } = UpdateDietPlanSchema.parse(
      req.body
    );
    const userId = req.userId; // Assuming user ID is available in the request (JWT or session)
    const now = new Date();

    // Calculate the offset for IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

    // Construct the current day in IST (midnight IST)
    const istToday = new Date(now.getTime() + istOffset);
    istToday.setUTCHours(0, 0, 0, 0);

    // Fetch the workout plan item by planItemId to get activity and its duration
    const workoutPlanItem = await prisma.workoutPlanItem.findUnique({
      where: { id: planItemId },
      include: {
        activity: true, // To get the activity data (calories_per_kg)
      },
    });
    console.log("workoutPlanItem", workoutPlanItem);

    if (!workoutPlanItem) {
      return res
        .status(404)
        .json({ success: false, message: "Workout plan item not found" });
    }

    const workoutPlanItemDate = new Date(workoutPlanItem.date);
    workoutPlanItemDate.setUTCHours(0, 0, 0, 0); // Normalize to 00:00:00 UTC

    // Compare the dates - workoutPlanItemDate with IST Today
    if (workoutPlanItemDate.getTime() !== istToday.getTime()) {
      return res.status(404).json({
        success: false,
        message: "You can't change an old workout plan item",
      });
    }

    // Get the user's weight from the profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
      select: { weight: true },
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    // Calculate calories burned per minute for the activity
    const caloriesPerMinute =
      workoutPlanItem.activity.calories_per_kg /
      workoutPlanItem.activity.duration;
    const caloriesBurned = userProfile.weight * caloriesPerMinute * duration;

    // Check if there is an existing DailyProgress entry for the user and the current date
    let dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: istToday.toISOString(), // Pass the IST normalized date string
        },
      },
    });

    if (!dailyProgress) {
      // If no entry exists, create a new entry for the day
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          user_id: userId,
          date: istToday.toISOString(), // Pass the IST normalized date string
          calories_burned: status === "COMPLETED" ? caloriesBurned : 0, // Initialize if completed
        },
      });
    } else {
      // Only update the daily progress if the status is changing from completed/skipped to pending
      if (status === "COMPLETED" && workoutPlanItem.status !== "COMPLETED") {
        // Add calories burned if status is completed
        dailyProgress = await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: istToday.toISOString(),
            },
          },
          data: {
            calories_burned: dailyProgress.calories_burned + caloriesBurned,
          },
        });
      } else if (status === "PENDING" && workoutPlanItem.status !== "PENDING") {
        // Subtract calories burned if status is pending (but only if previous status was not pending)
        dailyProgress = await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: istToday.toISOString(),
            },
          },
          data: {
            calories_burned: dailyProgress.calories_burned - caloriesBurned,
          },
        });
      }
    }

    // Update the workout plan item's status
    const updatedPlanItem = await prisma.workoutPlanItem.update({
      where: { id: planItemId },
      data: { status: status, duration: duration },
    });

    res.status(200).json({ success: true, updatedPlanItem, dailyProgress });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Invalid request body" });
  }
};

export const deleteUserWorkoutPlanItem = async (req, res) => {
  const { planItemId } = req.params;
  const userId = req.userId; // Assuming user ID is available in the request (e.g., via JWT authentication)

  try {
    // Retrieve the workout plan item to check its status and other details
    const workoutPlanItem = await prisma.workoutPlanItem.findUnique({
      where: { id: parseInt(planItemId) },
      include: {
        activity: true, // Include activity to get calorie information
        workout_plan: true, // Include workout plan to get the date
      },
    });

    if (!workoutPlanItem) {
      return res
        .status(404)
        .json({ success: false, message: "Workout plan item not found" });
    }

    // Get current date in IST (Indian Standard Time)
    const now = new Date();

    // Calculate the offset for IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

    // Construct the current day in IST (midnight IST)
    const istToday = new Date(now.getTime() + istOffset);
    istToday.setUTCHours(0, 0, 0, 0);

    // Convert both dates to ISO string format to ensure IST handling
    const todayISOString = istToday.toISOString();

    // Normalize workout plan item's date to 00:00:00 UTC
    const workoutPlanItemDate = new Date(workoutPlanItem.date);
    workoutPlanItemDate.setUTCHours(0, 0, 0, 0); // Normalize to 00:00:00 UTC

    // Compare the dates (ignoring time) between today and the workout plan item date
    if (workoutPlanItemDate.toISOString() !== todayISOString) {
      return res.status(404).json({
        success: false,
        message: "You can't delete an old workout plan item",
      });
    }

    // Check if the workout item was marked as completed
    if (workoutPlanItem.status === "COMPLETED") {
      // Get the user's profile (weight) to calculate calories burned
      const userProfile = await prisma.userProfile.findUnique({
        where: { user_id: userId },
      });

      if (!userProfile) {
        return res
          .status(404)
          .json({ success: false, message: "User profile not found" });
      }

      // Calculate calories burned based on the activity's calorie burn rate and user's weight
      const caloriesPerMinute =
        workoutPlanItem.activity.calories_per_kg /
        workoutPlanItem.activity.duration; // Calories burned per kg per minute
      const caloriesBurned =
        userProfile.weight * caloriesPerMinute * workoutPlanItem.duration; // Total calories burned

      // Use today's date for the daily progress
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0); // Normalize today's date

      // Find the daily progress entry for the user on today's date
      const dailyProgress = await prisma.dailyProgress.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: todayISOString, // Use today's date for comparison
          },
        },
      });
      console.log(dailyProgress);
      if (dailyProgress) {
        // Subtract the calories burned by this activity from the daily progress

        await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: todayISOString,
            },
          },
          data: {
            calories_burned: dailyProgress.calories_burned - caloriesBurned,
          },
        });
      }
    }

    // Now delete the workout plan item
    const deletedWorkoutPlan = await prisma.workoutPlanItem.delete({
      where: { id: parseInt(planItemId) },
    });

    res.status(200).json({ success: true, deletedWorkoutPlan });
  } catch (error) {
    console.error("Error during deletion process:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const createWorkoutPlanItemSchema = z.object({
  activity_id: z.number().int().positive(), // Ensuring activity_id is a positive integer
  duration: z.number().int().positive(), // Ensuring duration is a positive integer (in minutes or another unit)
});
export const createWorkoutPlanItem = async (req, res) => {
  const { body } = req;

  try {
    // Validate request body using Zod

    const parsedBody = createWorkoutPlanItemSchema.parse(body);

    // Continue with the rest of your logic
    const planId = await getOrCreateWorkoutPlan(req.userId); // Assuming there's a function to get or create a workout plan
    const date = await prisma.workoutPlan.findFirst({
      where: {
        user_id: req.userId,
        id: planId.planId,
      },
      select: {
        date: true,
      },
    });

    const workoutPlanItem = await prisma.workoutPlanItem.create({
      data: {
        workout_plan_id: planId.planId,
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: "PENDING", // Default status can be PENDING
        date: date.date, // Using the validated date
        plan_type: "USER", // Default plan type is USER
        created_by_id: req.userId,
        user_id: req.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workout Plan Item created successfully",
      workoutPlanItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors ? error.errors[0].message : error.message, // Error handling from Zod
    });
  }
};

export const getActivities = async (req, res) => {
  try {
    // Fetch activities from the database
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Check if no activities are found
    if (activities.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No activities found" });
    }

    // Return success response with activities
    res.status(200).json({ success: true, activities });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createActivitySchemaUser = z.object({
  name: z.string().min(1, "Activity name is required"), // Ensures the name is a non-empty string
  duration: z.number().min(1, "Duration must be at least 1 min"), // Ensures duration is at least 1 hour
  calories_per_kg: z
    .number()
    .min(0, "Calories per kg must be a positive number"), // Positive value for calories
  // Optional, in case the activity isn't associated with a specific user
});

export const createActivityUser = async (req, res) => {
  let body;
  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createActivitySchemaUser.parse(body); // Zod schema validation

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
        user_id: req.userId || null, // Optional user, can be null
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

// Schema for updating Diet Plan Items
const UpdateDietPlanItemSchema = z.object({
  planItemId: z.number(),
  quantity: z.number(),
  status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]),
});

// 1️ Get Diet Plan Items
export const getUserDietPlanItems = async (req, res) => {
  const userId = req.userId;
  const { date } = req.query;
  const requestedDate = new Date(date);
  const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

  try {
    const dietPlans = await prisma.dietPlan.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          select: {
            id: true, // Include item id
            quantity: true, // Include quantity
            status: true, // Include status
            food: {
              // Include related food item details
              select: {
                id: true, // Food id
                name: true, // Food name
                carbs: true, // Carbs value
                protein: true, // Protein value
                fats: true, // Fats value
              },
            },
          },
        },
      },
    });
    const mappedDietPlans = dietPlans.map((plan) => ({
      ...plan,
      items: plan.items.map((item) => ({
        id: item.id,
        foodItem: item.food.name, // Get food name from food relation
        carbs: item.food.carbs, // Get carbs from food relation
        protein: item.food.protein, // Get protein from food relation
        fats: item.food.fats, // Get fats from food relation
        quantity: item.quantity, // Get quantity
        status: item.status, // Get status
      })),
    }));

    return res.status(200).json({ success: true, dietPlan: mappedDietPlans });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching diet plans" });
  }
};

// 2️ Update Diet Plan Item
export const updateUserDietPlanItem = async (req, res) => {
  try {
    const { planItemId, quantity, status } = UpdateDietPlanItemSchema.parse(
      req.body
    );
    const userId = req.userId;

    // Get current date in IST (Indian Standard Time)
    const now = new Date();

    // Calculate the offset for IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

    // Construct the current day in IST (midnight IST)
    const istToday = new Date(now.getTime() + istOffset);
    istToday.setUTCHours(0, 0, 0, 0);

    // Calculate the end of the day in IST (23:59:59.999)
    const endOfDay = new Date(istToday);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Convert both dates to ISO string format to ensure IST handling
    const todayISOString = istToday.toISOString();

    // Fetch the diet plan item
    const dietPlanItem = await prisma.dietPlanItem.findUnique({
      where: { id: planItemId },
      include: { food: true },
    });

    if (!dietPlanItem) {
      return res
        .status(404)
        .json({ success: false, message: "Diet plan item not found" });
    }

    // Normalize dietPlanItem date to IST and set it to midnight
    console.log("Diet Plan Item Date:", dietPlanItem.date);

    console.log("Diet Plan Item Date:", dietPlanItem.date);
    console.log("Today IST:", todayISOString);

    // Check if the date matches today (ignoring time)
    if (dietPlanItem.date.toISOString() !== todayISOString) {
      return res.status(404).json({
        success: false,
        message: "You can't change an old diet plan item",
      });
    }

    // Fetch user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
      select: { weight: true },
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    // Calculate calories, protein, carbs, and fats per gram
    const caloriesPerGram =
      dietPlanItem.food.calories / dietPlanItem.food.serving_size_gm;
    const proteinPerGram =
      dietPlanItem.food.protein / dietPlanItem.food.serving_size_gm;
    const carbsPerGram =
      dietPlanItem.food.carbs / dietPlanItem.food.serving_size_gm;
    const fatsPerGram =
      dietPlanItem.food.fats / dietPlanItem.food.serving_size_gm;

    // Calculate consumption based on quantity
    const caloriesConsumed = caloriesPerGram * quantity;
    const proteinConsumed = proteinPerGram * quantity;
    const carbsConsumed = carbsPerGram * quantity;
    const fatsConsumed = fatsPerGram * quantity;

    // Check if there is already daily progress for today
    let dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: todayISOString, // Use today in IST
        },
      },
    });

    if (!dailyProgress) {
      // Create a new daily progress entry if none exists
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          user_id: userId,
          date: todayISOString,
          calories_intake: status === "COMPLETED" ? caloriesConsumed : 0,
          protein_intake: status === "COMPLETED" ? proteinConsumed : 0,
          carbs_intake: status === "COMPLETED" ? carbsConsumed : 0,
          fats_intake: status === "COMPLETED" ? fatsConsumed : 0,
        },
      });
    } else {
      // Update the daily progress based on the status change
      if (status === "COMPLETED" && dietPlanItem.status !== "COMPLETED") {
        // Add the consumed values to daily progress if the status is changing to "COMPLETED"
        dailyProgress = await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: todayISOString,
            },
          },
          data: {
            calories_intake: dailyProgress.calories_intake + caloriesConsumed,
            protein_intake: dailyProgress.protein_intake + proteinConsumed,
            carbs_intake: dailyProgress.carbs_intake + carbsConsumed,
            fats_intake: dailyProgress.fats_intake + fatsConsumed,
          },
        });
      } else if (status === "PENDING" && dietPlanItem.status !== "PENDING") {
        // Subtract the consumed values from daily progress if the status is changing to "PENDING"
        dailyProgress = await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: todayISOString,
            },
          },
          data: {
            calories_intake: dailyProgress.calories_intake - caloriesConsumed,
            protein_intake: dailyProgress.protein_intake - proteinConsumed,
            carbs_intake: dailyProgress.carbs_intake - carbsConsumed,
            fats_intake: dailyProgress.fats_intake - fatsConsumed,
          },
        });
      }
    }

    // Update the status of the diet plan item
    const updatedPlanItem = await prisma.dietPlanItem.update({
      where: { id: planItemId },
      data: { status: status, quantity: quantity },
    });

    // Respond with the updated diet plan item and daily progress
    res.status(200).json({
      success: true,
      message: "Diet Plan Item updated successfully",
      updatedPlanItem,
      dailyProgress,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Invalid request body" });
  }
};

// 3️ Delete Diet Plan Item
// export const deleteUserDietPlanItem = async (req, res) => {
//   const { planItemId } = req.params;
//   const userId = req.userId;

//   try {
//     const dietPlanItem = await prisma.dietPlanItem.findUnique({
//       where: { id: parseInt(planItemId) },
//       include: { food: true, diet_plan: true },
//     });

//     if (!dietPlanItem) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Diet plan item not found" });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const dietPlanItemDate = new Date(dietPlanItem.date);
//     dietPlanItemDate.setUTCHours(0, 0, 0, 0);
//     const today1 = new Date();
//     const normalizedTodayUTC = new Date(today1.toISOString());
//     normalizedTodayUTC.setUTCHours(0, 0, 0, 0);
// console.log(dietPlanItemDate, normalizedTodayUTC);
//     if (dietPlanItemDate.getTime() !== normalizedTodayUTC.getTime()) {
//       return res.status(404).json({
//         success: false,
//         message: "You can't delete an old diet plan item",
//       });
//     }

//     if (dietPlanItem.status === "COMPLETED") {
//       const userProfile = await prisma.userProfile.findUnique({
//         where: { user_id: userId },
//       });

//       if (!userProfile) {
//         return res
//           .status(404)
//           .json({ success: false, message: "User profile not found" });
//       }

//       const caloriesPerGram =
//         dietPlanItem.food.calories / dietPlanItem.food.serving_size_gm;
//       const caloriesConsumed = caloriesPerGram * dietPlanItem.quantity;
//       const proteinPerGram =
//         dietPlanItem.food.protein / dietPlanItem.food.serving_size_gm;
//       const carbsPerGram =
//         dietPlanItem.food.carbs / dietPlanItem.food.serving_size_gm;
//       const fatsPerGram =
//         dietPlanItem.food.fats / dietPlanItem.food.serving_size_gm;
//       const proteinConsumed = proteinPerGram * dietPlanItem.quantity;
//       const carbsConsumed = carbsPerGram * dietPlanItem.quantity;
//       const fatsConsumed = fatsPerGram * dietPlanItem.quantity;

//       const dailyProgress = await prisma.dailyProgress.findUnique({
//         where: {
//           user_id_date: {
//             user_id: userId,
//             date: today,
//           },
//         },
//       });

//       if (dailyProgress) {
//         await prisma.dailyProgress.update({
//           where: {
//             user_id_date: {
//               user_id: userId,
//               date: today,
//             },
//           },
//           data: {
//             calories_intake: dailyProgress.calories_intake - caloriesConsumed,
//             protein_intake: dailyProgress.protein_intake - proteinConsumed,
//             carbs_intake: dailyProgress.carbs_intake - carbsConsumed,
//             fats_intake: dailyProgress.fats_intake - fatsConsumed,
//           },
//         });
//       }
//     }

//     const deletedDietPlanItem = await prisma.dietPlanItem.delete({
//       where: { id: parseInt(planItemId) },
//     });

//     res.status(200).json({ success: true, deletedDietPlanItem });
//   } catch (error) {
//     console.error("Error during deletion process:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

export const deleteUserDietPlanItem = async (req, res) => {
  const { planItemId } = req.params;
  const userId = req.userId;

  try {
    // Fetch the diet plan item from the database
    const dietPlanItem = await prisma.dietPlanItem.findUnique({
      where: { id: parseInt(planItemId) },
      include: { food: true, diet_plan: true },
    });

    if (!dietPlanItem) {
      return res
        .status(404)
        .json({ success: false, message: "Diet plan item not found" });
    }

    // Get current date in IST (Indian Standard Time)
    const now = new Date();

    // Calculate the offset for IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

    // Construct the current day in IST (midnight IST)
    const istToday = new Date(now.getTime() + istOffset);
    istToday.setUTCHours(0, 0, 0, 0);

    // Calculate the end of the day in IST (23:59:59.999)
    const endOfDay = new Date(istToday);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Convert both dates to ISO string format to ensure IST handling
    const todayISOString = istToday.toISOString();

    // Compare the dates (ignoring time) between today and the diet plan item date
    if (dietPlanItem.date.toISOString() !== todayISOString) {
      return res.status(404).json({
        success: false,
        message: "You can't delete an old diet plan item",
      });
    }

    // Proceed with the deletion logic if the dates match (same day)
    if (dietPlanItem.status === "COMPLETED") {
      const userProfile = await prisma.userProfile.findUnique({
        where: { user_id: userId },
      });

      if (!userProfile) {
        return res
          .status(404)
          .json({ success: false, message: "User profile not found" });
      }

      const caloriesPerGram =
        dietPlanItem.food.calories / dietPlanItem.food.serving_size_gm;
      const caloriesConsumed = caloriesPerGram * dietPlanItem.quantity;
      const proteinPerGram =
        dietPlanItem.food.protein / dietPlanItem.food.serving_size_gm;
      const carbsPerGram =
        dietPlanItem.food.carbs / dietPlanItem.food.serving_size_gm;
      const fatsPerGram =
        dietPlanItem.food.fats / dietPlanItem.food.serving_size_gm;
      const proteinConsumed = proteinPerGram * dietPlanItem.quantity;
      const carbsConsumed = carbsPerGram * dietPlanItem.quantity;
      const fatsConsumed = fatsPerGram * dietPlanItem.quantity;

      const dailyProgress = await prisma.dailyProgress.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: todayISOString, // Use today in IST
          },
        },
      });

      if (dailyProgress) {
        await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: todayISOString,
            },
          },
          data: {
            calories_intake: dailyProgress.calories_intake - caloriesConsumed,
            protein_intake: dailyProgress.protein_intake - proteinConsumed,
            carbs_intake: dailyProgress.carbs_intake - carbsConsumed,
            fats_intake: dailyProgress.fats_intake - fatsConsumed,
          },
        });
      }
    }

    // Delete the diet plan item from the database
    const deletedDietPlanItem = await prisma.dietPlanItem.delete({
      where: { id: parseInt(planItemId) },
    });

    res.status(200).json({
      success: true,
      message: "Diet Plan Item deleted successfully",
      deletedDietPlanItem,
    });
  } catch (error) {
    console.error("Error during deletion process:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createDietPlanItemSchema = z.object({
  // diet_plan_id: z.number().min(1, "Diet Plan ID is required"),
  meal_type: z.enum(
    ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
    "Invalid meal type"
  ),
  food_id: z.number().min(1, "Food ID is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than zero"),
});
export const createDietPlanItem = async (req, res) => {
  const { body } = req;

  try {
    // Validate request body using Zod
    const parsedBody = createDietPlanItemSchema.parse(body);
    const planId = await getOrCreateDietPlan(req.userId);
    const date = await prisma.dietPlan.findFirst({
      where: {
        user_id: req.userId,
        id: planId.planId,
      },
      select: {
        date: true,
      },
    });

    // Create new DietPlanItem
    const dietPlanItem = await prisma.dietPlanItem.create({
      data: {
        diet_plan_id: planId.planId,
        meal_type: parsedBody.meal_type,
        food_id: parsedBody.food_id,
        quantity: parsedBody.quantity,
        user_id: req.userId,
        plan_type: "USER", // Default to "USER" if not provided
        date: date.date,
        created_by_id: req.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Diet Plan Item created successfully",
      dietPlanItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFoodCatalogue = async (req, res) => {
  try {
    // Step 1: Fetch all food items from the database
    const foods = await prisma.foodCatalogue.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Step 2: Check if there are no food items
    if (foods.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No food items found",
      });
    }

    // Step 3: Return all food items
    return res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    // Step 4: Handle any errors
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const createFoodCatalogueSchemaUser = z.object({
  name: z.string().min(1, "Food name is required"),
  calories: z.number().min(1, "Calories must be a positive number"),
  carbs: z.number().min(0, "Carbs must be a positive number"),
  protein: z.number().min(0, "Protein must be a positive number"),
  fats: z.number().min(0, "Fats must be a positive number"),
  serving_size_gm: z.number().min(1, "Serving size must be a positive number"),
});

export const createFoodCatalogueUser = async (req, res) => {
  let body;
  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createFoodCatalogueSchemaUser.parse(body); // Zod schema validation

    // Step 2: Check if Food already exists
    const foodExists = await prisma.foodCatalogue.findUnique({
      where: { name: parsedBody.name },
    });

    if (foodExists) {
      return res.status(400).json({
        success: false,
        message: "Food item with this name already exists",
      });
    }

    // Step 3: Create Food in the database
    const food = await prisma.foodCatalogue.create({
      data: {
        name: parsedBody.name,
        calories: parsedBody.calories,
        carbs: parsedBody.carbs,
        protein: parsedBody.protein,
        fats: parsedBody.fats,
        serving_size_gm: parsedBody.serving_size_gm,
        user_id: req.userId,
      },
    });

    // Step 4: Return success response
    return res.status(201).json({
      success: true,
      message: "Food item created successfully",
      food,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
