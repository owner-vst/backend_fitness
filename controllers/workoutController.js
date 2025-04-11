import prisma from "../db/prismaClient.js";
import { z } from "zod";
import OpenAI from "openai";
export const createActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"), // Ensures the name is a non-empty string
  duration: z.number().min(1, "Duration must be at least 1 hour"), // Ensures duration is at least 1 hour
  calories_per_kg: z
    .number()
    .min(0, "Calories per kg must be a positive number"), // Positive value for calories
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
        user_id: req.userId, // Optional user, can be null
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
  plan_type: z.enum(["AI", "USER"]).optional(), // Example plan_type, adjust as needed
});
const UpdateWorkoutPlanItemSchema = z.object({
  activity_id: z.number().int().optional(), // Optional, as it's not required to update
  duration: z.number().int().optional(), // Optional, as it's not required to update
  status: z.enum(["PENDING", "COMPLETED", "SKIPPED"]).optional(), // Optional, as it's not required to update
  user_id: z.number().int().optional(), // Optional, as it's not required to update
  plan_type: z.enum(["AI", "USER"]).optional(), // Optional, as it's not required to update

  // Optional, as created_by_id typically should not be updated
});

export const createWorkoutPlanItem = async (req, res) => {
  try {
    // Validate the request body
    const parsedBody = workoutPlanItemSchema.parse(req.body);
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: parsedBody.workout_plan_id,
        user_id: parsedBody.user_id,
      },
      select: {
        date: true,
      },
    });

    if (!workoutPlan) {
      return res.status(403).json({
        success: false,
        message:
          "Workout Plan does not belong to the specified user or does not exist",
      });
    }

    // Create a new workout plan item
    const workoutPlanItem = await prisma.workoutPlanItem.create({
      data: {
        workout_plan_id: parsedBody.workout_plan_id,
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: parsedBody.status,
        user_id: parsedBody.user_id, // Added user_id
        plan_type: parsedBody.plan_type || "USER", // Added plan_type
        date: workoutPlan.date, // Added date
        created_by_id: req.userId, // Assuming user is authenticated and their ID is stored in `req.user.id`
      },
    });

    res.status(201).json({
      success: true,
      message: "Workout Plan Item created successfully",
      workoutPlanItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// export const updateWorkoutPlanItem = async (req, res) => {
//   const { id } = req.params; // Get the workout plan item ID from the URL params
//   try {
//     // Validate the request body
//     const parsedBody = UpdateWorkoutPlanItemSchema.parse(req.body);
//     const workoutPlan = await prisma.workoutPlan.findFirst({
//       where: {
//         id: parsedBody.workout_plan_id,
//         user_id: parsedBody.user_id,
//       },
//       select: {
//         date: true,
//       },
//     });

//     if (!workoutPlan) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Workout Plan does not belong to the specified user or does not exist",
//       });
//     }

//     // Update the workout plan item
//     const updatedWorkoutPlanItem = await prisma.workoutPlanItem.update({
//       where: { id: parseInt(id) },
//       data: {
//         activity_id: parsedBody.activity_id,
//         duration: parsedBody.duration,
//         status: parsedBody.status,
//         user_id: parsedBody.user_id, // Updated user_id
//         plan_type: parsedBody.plan_type || "USER", // Updated plan_type
//         date: workoutPlan.date, // Updated date
//         created_by_id: req.userId,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       updatedWorkoutPlanItem,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const updateWorkoutPlanItem = async (req, res) => {
  const { id } = req.params;

  const workoutPlanId = req.body.workout_plan_id;
  console.log("workout plan id", workoutPlanId);

  try {
    const parsedBody = UpdateWorkoutPlanItemSchema.parse(req.body);
    console.log("parsed body", parsedBody);

    // Fetch the plan to get its date
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: workoutPlanId,
        user_id: parsedBody.user_id,
      },
      select: { date: true },
    });

    if (!workoutPlan) {
      return res.status(403).json({
        success: false,
        message: "Workout Plan not found or does not belong to the user",
      });
    }
    console.log("workout plan", workoutPlan);
    // Get the old workout item (with activity)
    const oldWorkoutItem = await prisma.workoutPlanItem.findUnique({
      where: { id: parseInt(id) },
      include: { activity: true },
    });

    if (!oldWorkoutItem) {
      return res.status(404).json({
        success: false,
        message: "Workout item not found",
      });
    }

    // Update workout item
    const updatedWorkoutPlanItem = await prisma.workoutPlanItem.update({
      where: { id: parseInt(id) },
      data: {
        activity_id: parsedBody.activity_id,
        duration: parsedBody.duration,
        status: parsedBody.status,
        user_id: parsedBody.user_id,
        plan_type: parsedBody.plan_type || "USER",
        date: workoutPlan.date,
        created_by_id: req.userId,
      },
      include: { activity: true },
    });

    // Get user weight
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: parsedBody.user_id },
      select: { weight: true },
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const weight = userProfile.weight;

    // New calories (if status is completed)
    const newCaloriesPerMin =
      updatedWorkoutPlanItem.activity.calories_per_kg /
      updatedWorkoutPlanItem.activity.duration;

    const newCalories = weight * newCaloriesPerMin * parsedBody.duration;

    // Old calories (if status was completed)
    let oldCalories = 0;
    if (oldWorkoutItem.status === "COMPLETED") {
      const oldPerMin =
        oldWorkoutItem.activity.calories_per_kg /
        oldWorkoutItem.activity.duration;
      oldCalories = weight * oldPerMin * oldWorkoutItem.duration;
    }

    // Get or create daily progress

    let dailyProgress = await prisma.dailyProgress.findFirst({
      where: {
        user_id: oldWorkoutItem.user_id,
        date: workoutPlan.date,
      },
    });
    console.log("old one", dailyProgress);

    if (!dailyProgress) {
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          user_id: parsedBody.user_id,
          date: workoutPlan.date,
          calories_burned: parsedBody.status === "COMPLETED" ? newCalories : 0,
        },
      });
    } else {
      let caloriesDiff = 0;

      if (parsedBody.status === "COMPLETED") {
        if (oldWorkoutItem.status === "COMPLETED") {
          caloriesDiff = newCalories - oldCalories;
        } else {
          caloriesDiff = newCalories;
        }
      } else if (
        parsedBody.status === "PENDING" &&
        oldWorkoutItem.status === "COMPLETED"
      ) {
        caloriesDiff = -oldCalories;
      }

      await prisma.dailyProgress.update({
        where: {
          user_id_date: {
            user_id: oldWorkoutItem.user_id,
            date: workoutPlan.date,
          },
        },
        data: {
          calories_burned: {
            increment: caloriesDiff,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      updatedWorkoutPlanItem,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// export const deleteWorkoutPlanItem = async (req, res) => {
//   const { id } = req.params; // Get the workout plan item ID from the URL params
//   try {
//     // Delete the workout plan item
//     const deletedWorkoutPlanItem = await prisma.workoutPlanItem.delete({
//       where: { id: parseInt(id) },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Workout plan item deleted successfully",
//       deletedWorkoutPlanItem,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const deleteWorkoutPlanItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the workout plan item along with its activity
    const workoutPlanItem = await prisma.workoutPlanItem.findUnique({
      where: { id: parseInt(id) },
      include: { activity: true },
    });

    if (!workoutPlanItem) {
      return res.status(404).json({
        success: false,
        message: "Workout plan item not found",
      });
    }

    // Only adjust daily progress if item was completed
    if (workoutPlanItem.status === "COMPLETED") {
      const userProfile = await prisma.userProfile.findUnique({
        where: { user_id: workoutPlanItem.user_id },
        select: { weight: true },
      });

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      const weight = userProfile.weight;

      const caloriesPerMin =
        workoutPlanItem.activity.calories_per_kg /
        workoutPlanItem.activity.duration;

      const caloriesBurned = weight * caloriesPerMin * workoutPlanItem.duration;

      // Update daily progress if it exists
      const progressDate = new Date(workoutPlanItem.date);
      progressDate.setUTCHours(0, 0, 0, 0);

      const dailyProgress = await prisma.dailyProgress.findFirst({
        where: {
          user_id: workoutPlanItem.user_id,
          date: progressDate,
        },
      });

      if (dailyProgress) {
        await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: workoutPlanItem.user_id,
              date: progressDate,
            },
          },
          data: {
            calories_burned: {
              decrement: caloriesBurned,
            },
          },
        });
      }
    }

    // Finally, delete the workout plan item
    const deletedWorkoutPlanItem = await prisma.workoutPlanItem.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Workout plan item deleted successfully",
      deletedWorkoutPlanItem,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getAllWorkoutPlanItems = async (req, res) => {
  try {
    // Fetch all workout plan items from the database
    const rawItems = await prisma.workoutPlanItem.findMany({
      select: {
        id: true,
        workout_plan_id: true,
        activity_id: true,
        status: true,
        created_by_id: true,
        plan_type: true,
        duration: true,

        user_id: true,
        user: {
          select: {
            name: true,
          },
        },
        activity: {
          select: {
            name: true,
          },
        },
      },
    });
    const workoutPlanItems = rawItems.map((item) => ({
      id: item.id,
      workout_plan_id: item.workout_plan_id,
      activity_id: item.activity_id,
      status: item.status,
      created_by_id: item.created_by_id,
      plan_type: item.plan_type,
      duration: item.duration,
      user_id: item.user_id,
      user_name: item.user.name,
      activity_name: item.activity.name,
    }));

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

export const fetchSuggestedWorkoutPlan = async (req, res) => {
  try {
    const workout_items = await prisma.activity.findMany();

    let workout_planId = await getOrCreateWorkoutPlan(req.userId);
    workout_planId = workout_planId.planId;
    const calories = await calculateCalories(req.userId);
    const goal = calories.goal;

    const calories_burned = calories.caloriesToBurn;
    const planItems = await getWorkoutPlanItems(req.userId, workout_planId);
    const formattedWorkoutItems = workout_items.map((item) => ({
      id: item.activity_id,
      name: item.name,
      calories_burned: item.calories_per_kg,
    }));

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4o",
      instructions: `You are a Professional Workout Planner.\
        Your task is to suggest a workout plan based on the user's preferences and goals.\
        You should provide a detailed breakdown of the workouts, including the exercises, duration, and calories burned.\
        You should also include any necessary modifications or substitutions to ensure the user's fitness needs are met.\
        The plan should be presented in a clear and concise manner, with a focus on the user's goals and preferences.\
        Please ensure that the plan is realistic and achievable, and that it aligns with the user's values and priorities.\
        User Preferences:\
        - User is looking to reach goal ${goal}.\
        - User prefers a mix of cardio and strength training.\
        - User enjoys moderate to high-intensity workouts.\
        - User is looking for a balanced and effective workout routine.\
        - User will have all 2-3 types of workouts (MORNING, EVENING, NIGHT) and the duration of each workout.\
        - If ${planItems} have plan items then suggest for which workout type is missing plan item, and it should also satisfy total calories_burned and return the workout plan items which are missing\
        - For each workout type, the user will have only one exercise.\
        - User should burn ${calories_burned} calories per day\
        - The suggested plan items calories burned should be ${calories_burned} calories per day not more than ${calories_burned} calories per day\
        - The sum of all calories burned in the suggested plan should be ${calories_burned} calories and calculate this calories by workoutitem.calories_burned*calories.weight*(workoutplan_item.duration/60)
        - Strictly follow the provided instructions and format for output.\

        Workout Items Catalogue:\
        - ${JSON.stringify(formattedWorkoutItems)}\
        - So the output JSON should be like this:\
        Output Format (JSON):\
        {
          workout_plan: {
          {
            "workout_plan_id": ${workout_planId},
            "activity_id": 1,
            "duration": 30,
            "status": "PENDING",
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}",
            "created_by_id": 1,
            
          },
          {
            "workout_plan_id": ${workout_planId},
            "activity_id": 2,
            "duration": 45,
            "status": "PENDING",
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}"
            "created_by_id": 1
          
          }

          }
        }\
        Instructions:\
        1. Strictly follow the provided instructions and format.\
        2. Do not include any additional text or explanations.\
        3. Ensure that the output is a valid JSON object.\
        4. Do not include any additional fields or properties.\
        5. Do not include any additional exercises or variations.\
        6. Do not include any exercises that are not in the catalogue.\
        7. Strictly follow the provided instructions and format for output.\
        8. Calories burned per day should be ${calories_burned} calories per day not more than ${calories_burned} calories per day\
        `,
      input:
        "Suggest a workout plan for a user by following the instructions\
      and following the format, and return the workout plan items which are missing\
      for the user",
    });
    const outputText = response.output_text;
    const jsonStart = outputText.indexOf("```json") + 7;
    const jsonEnd = outputText.lastIndexOf("```");
    const jsonString = outputText.slice(jsonStart, jsonEnd).trim();
    const workoutPlan = JSON.parse(jsonString);
    await createMultipleWorkoutPlanItemsHelper(
      workoutPlan,
      workout_planId,
      req.userId
    );
    return res.status(200).json({
      success: true,
      suggestedWorkoutPlan: workoutPlan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getOrCreateWorkoutPlan = async (userId) => {
  try {
    // Get the current date in UTC
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
    const endOfDayISOString = endOfDay.toISOString();
    // Check if there's an existing plan for the user today (in UTC)
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: todayISOString, // Greater than or equal to the start of today in IST
          lt: endOfDayISOString, // Less than the start of the next day in IST
          // Less than the start of the next day
        },
      },
    });

    // If the plan already exists for today, return the plan ID
    if (existingPlan) {
      return { planId: existingPlan.id };
    }

    // If no plan exists, create a new workout plan for the user
    const newPlan = await prisma.workoutPlan.create({
      data: {
        user_id: userId,
        date: todayISOString, // Set date to the UTC start of the day
        // You can add other default fields like created_at if needed
      },
    });

    // Return the new plan ID
    return { planId: newPlan.id };
  } catch (error) {
    console.error("Error fetching or creating workout plan:", error);
    throw new Error("Something went wrong while handling the workout plan.");
  }
};

export const calculateCalories = async (userId) => {
  try {
    // Extract the user profile and user data from the database using the userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserProfile: true, // Include the userProfile related data
      },
    });

    if (!user || !user.UserProfile) {
      throw new Error("User or UserProfile not found.");
    }

    // Destructure userProfile and user to get the necessary fields
    const { height, weight, activity_type, goal } = user.UserProfile;
    const { dob } = user; // Get the dob (date of birth) from the User schema
    const gender = user.gender;

    // Calculate the user's age based on the date of birth
    const currentDate = new Date();
    const birthDate = new Date(dob);
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const month = currentDate.getMonth();
    if (
      month < birthDate.getMonth() ||
      (month === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Validate the input
    if (!height || !weight || !activity_type || !goal || !gender) {
      throw new Error("All fields are required.");
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    function calculateBMR(weight, height, age, gender) {
      if (gender === "male") {
        return 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
      }
    }

    // Activity multipliers based on activity type
    const activityMultipliers = {
      LAZY: 1.2, // Sedentary
      MODERATE: 1.375, // Lightly active
      ACTIVE: 1.55, // Moderately active
      SPORTS_PERSON: 1.725, // Very active
    };

    // Get the activity multiplier based on activity type
    const activityMultiplier = activityMultipliers[activity_type];
    if (!activityMultiplier) {
      throw new Error("Invalid activity type.");
    }

    // Determine the BMR based on the gender
    const BMR = calculateBMR(weight, height, age, gender);

    // Calculate TDEE (Total Daily Energy Expenditure)
    const TDEE = BMR * activityMultiplier;

    // Calculate calories for the goal (weight loss, maintenance, or weight gain)
    let caloriesForGoal = {
      maintain: TDEE,
      lose: TDEE - 500, // 500-calorie deficit for weight loss
      gain: TDEE + 500, // 500-calorie surplus for weight gain
    };

    // Adjust based on the user goal input
    let dailyCalories;
    let caloriesToBurn;

    if (goal.toLowerCase() === "maintain") {
      dailyCalories = TDEE;
      caloriesToBurn = 300; // For maintenance, we don't need to burn extra
    } else if (goal.toLowerCase() === "lose") {
      dailyCalories = TDEE - 500;
      caloriesToBurn = 500; // Suggested 500-calorie deficit to burn for weight loss
    } else if (goal.toLowerCase() === "gain") {
      dailyCalories = TDEE + 500;
      caloriesToBurn = 200; // For weight gain, burning extra calories isn't prioritized
    } else {
      throw new Error("Invalid goal. Use 'gain', 'lose', or 'maintain'.");
    }

    // Return the calculated values as an object
    return {
      BMR,
      TDEE,
      goal,
      weight,
      caloriesForGoal: {
        maintain: caloriesForGoal.maintain,
        lose: caloriesForGoal.lose,
        gain: caloriesForGoal.gain,
      },
      caloriesToBurn,
      dailyCalories,
    };
  } catch (error) {
    console.error("Error calculating calories:", error.message);
    throw new Error("Internal server error");
  }
};

export const getWorkoutPlanItems = async (userId, planId) => {
  try {
    const planItems = await prisma.workoutPlanItem.findMany({
      where: {
        user_id: userId,
        workout_plan_id: planId.planId,
      },
    });
    return planItems;
  } catch (error) {
    console.error("Error getting diet plan items:", error.message);
    throw new Error("Internal server error");
  }
};
export const createMultipleWorkoutPlanItemsHelper = async (
  parsedBody,
  workout_planId,
  userId
) => {
  // Fetch the date associated with the workout plan to be updated
  const dateToBeUpdated = await prisma.workoutPlan.findFirst({
    where: {
      id: workout_planId,
    },
    select: {
      date: true,
    },
  });

  try {
    // Fetch the existing workout plan items for comparison
    const existingWorkoutPlans = await prisma.workoutPlanItem.findMany({
      where: {
        workout_plan_id: workout_planId,
        user_id: userId, // Filter by user_id to avoid duplicates
      },
    });

    // Extract existing activity IDs from the database
    const existingActivityIds = existingWorkoutPlans.map(
      (item) => item.activity_id
    );

    // Prepare data for missing workout plan items only
    const workoutPlanItems = [];

    // Iterate through the parsedBody workout_plan object and check if each activity already exists
    for (let item of Object.values(parsedBody.workout_plan)) {
      // Check if the activity_id already exists in the existing database
      if (!existingActivityIds.includes(item.activity_id)) {
        // If not, create a new item to insert into the database
        const newItem = {
          workout_plan_id: workout_planId,
          activity_id: item.activity_id,
          duration: item.duration,
          user_id: userId,
          plan_type: item.plan_type || "AI", // Default to "AI" if missing
          date: dateToBeUpdated.date,
          created_by_id: item.created_by_id,
          status: item.status || "PENDING", // Default to "PENDING" if missing
        };

        // Add missing item to the workoutPlanItems array
        workoutPlanItems.push(newItem);
      }
    }

    // Limit the number of items to create to 3
    const limitedWorkoutPlanItems = workoutPlanItems.slice(0, 3);

    // If there are items to create, insert them into the database
    if (limitedWorkoutPlanItems.length > 0) {
      const workoutPlanItemsCreated = await prisma.workoutPlanItem.createMany({
        data: limitedWorkoutPlanItems,
      });

      // Return success message with created workout plan items
      return {
        success: true,
        message: "Workout Plan Items created successfully",
        workoutPlanItems: workoutPlanItemsCreated,
      };
    } else {
      // If all items already exist, return a message indicating that
      return {
        success: true,
        message: "All workout plan items already exist in the database",
      };
    }
  } catch (error) {
    console.error("Error creating workout plan items:", error);
    throw new Error(error.message);
  }
};
