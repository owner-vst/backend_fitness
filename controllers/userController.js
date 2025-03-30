import prisma from "../db/prismaClient.js";
import { z } from "zod";
import { updateDietPlan } from "./planController.js";
import { startOfDay } from "date-fns";

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
  // const workoutPlans = await prisma.workoutPlan.findMany({
  //   where: {
  //     user_id: userId,
  //     date: {
  //       gte: startOfDay,
  //       lte: endOfDay,
  //     },
  //   },
  // });
  const workoutPlans = await prisma.$queryRaw`
 SELECT id, date FROM WorkoutPlan WHERE user_id = 8 AND date = '2025-03-27';;
`;

  return res.status(200).json({ success: true, workoutPlans });
};
const UpdateDietPlanSchema = z.object({
  planItemId: z.number(),
  status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]),
});
export const updateUserWorkoutPlanItems = async (req, res) => {
  try {
    const { planItemId, status } = UpdateDietPlanSchema.parse(req.body);
    const userId = req.userId; // Assuming user ID is available in the request (JWT or session)

    // Get the workout plan item by planItemId to get activity and its duration
    const workoutPlanItem = await prisma.workoutPlanItem.findUnique({
      where: { id: planItemId },
      include: {
        activity: true, // To get the activity data (calories_per_kg)
      },
    });

    if (!workoutPlanItem) {
      return res
        .status(404)
        .json({ success: false, message: "Workout plan item not found" });
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
    const caloriesPerMinute = workoutPlanItem.activity.calories_per_kg / 60;
    const caloriesBurned =
      userProfile.weight * caloriesPerMinute * workoutPlanItem.duration;

    // Check if there is an existing DailyProgress entry for the user and the current date
    const today = new Date();
    console.log("Current Date: from update func", today);
    const currentDate = new Date(today.setHours(0, 0, 0, 0)); // Normalize to 00:00:00 to ignore time

    let dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: currentDate, // Pass the Date object directly
        },
      },
    });

    if (!dailyProgress) {
      // If no entry exists, create a new entry for the day
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          user_id: userId,
          date: currentDate, // Pass the Date object directly
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
              date: currentDate, // Pass the Date object directly
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
              date: currentDate, // Pass the Date object directly
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
      data: { status: status },
    });

    res.status(200).json({ success: true, updatedPlanItem, dailyProgress });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Invalid request body" });
  }
};

export const deleteUserWorkoutPlanItem = async (req, res) => {
  const { planItemId } = req.params;
  const userId = req.userId; // Assuming user ID is stored in the request (e.g., via JWT authentication)

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

    console.log("Workout Plan Item found:", workoutPlanItem);

    // Check if the workout item was marked as completed
    if (workoutPlanItem.status === "COMPLETED") {
      console.log("The workout item was marked as COMPLETED.");

      // Get the user's profile (weight) to calculate calories burned
      const userProfile = await prisma.userProfile.findUnique({
        where: { user_id: userId },
      });

      if (!userProfile) {
        return res
          .status(404)
          .json({ success: false, message: "User profile not found" });
      }

      console.log("User Profile found:", userProfile);

      // Calculate calories burned
      const caloriesPerMinute = workoutPlanItem.activity.calories_per_kg / 60; // Calories burned per kg per minute
      const caloriesBurned =
        userProfile.weight * caloriesPerMinute * workoutPlanItem.duration; // Total calories burned

      console.log("Calories burned:", caloriesBurned);

      // Use today's date instead of the workout plan's start date
      const todayDate = new Date(); // Get today's date
      console.log("Using today's date:", todayDate);

      // Find the daily progress entry for the user on today's date
      const dailyProgress = await prisma.dailyProgress.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: todayDate, // Use today's date
          },
        },
      });

      if (dailyProgress) {
        console.log("Found Daily Progress entry for today:", dailyProgress);

        // Subtract the calories burned by this activity from the daily progress
        await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: todayDate,
            },
          },
          data: {
            calories_burned: dailyProgress.calories_burned - caloriesBurned,
          },
        });

        console.log(
          "Updated Daily Progress entry for today with calories burned."
        );
      } else {
        console.log("No Daily Progress entry found for today.");
      }
    } else {
      console.log("The workout item was not marked as COMPLETED.");
    }

    // Now delete the workout plan item
    const deletedWorkoutPlan = await prisma.workoutPlanItem.delete({
      where: { id: parseInt(planItemId) },
    });

    console.log("Deleted Workout Plan Item:", deletedWorkoutPlan);

    res.status(200).json({ success: true, deletedWorkoutPlan });
  } catch (error) {
    console.error("Error during deletion process:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteUserWorkoutPlanItems = async (req, res) => {
  const { planItemId } = req.params;
  const userId = req.userId; // Assuming user ID is stored in the request (e.g., via JWT authentication)

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

    // Log workout plan item to debug
    console.log("Workout Plan Item:", workoutPlanItem);

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

      // Calculate calories burned
      const caloriesPerMinute = workoutPlanItem.activity.calories_per_kg / 60; // Calories burned per kg per minute
      const caloriesBurned =
        userProfile.weight * caloriesPerMinute * workoutPlanItem.duration; // Total calories burned

      // Get the current date of the workout plan (ensure date format is correct)
      const workoutPlanDate = new Date(
        workoutPlanItem.workout_plan.start_date
      ).setHours(0, 0, 0, 0); // Normalize to midnight for exact date comparison
      console.log("Workout Plan Date (Normalized):", workoutPlanDate);

      // Find the daily progress entry for the user on the date of the workout plan item
      const dailyProgress = await prisma.dailyProgress.findUnique({
        where: {
          user_id_date: {
            user_id: userId,
            date: workoutPlanDate, // Pass the Date object directly
          },
        },
      });

      // Log daily progress for debugging
      console.log("Daily Progress:", dailyProgress);

      if (dailyProgress) {
        // Subtract the calories burned by this activity from the daily progress
        const updatedCaloriesBurned =
          dailyProgress.calories_burned - caloriesBurned;
        console.log("Updated Calories Burned:", updatedCaloriesBurned);

        await prisma.dailyProgress.update({
          where: {
            user_id_date: {
              user_id: userId,
              date: workoutPlanDate,
            },
          },
          data: {
            calories_burned: updatedCaloriesBurned,
          },
        });
      } else {
        console.log("No daily progress entry found for this date");
      }
    }

    // Now delete the workout plan item
    const deletedWorkoutPlan = await prisma.workoutPlanItem.delete({
      where: { id: parseInt(planItemId) },
    });

    res.status(200).json({ success: true, deletedWorkoutPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
