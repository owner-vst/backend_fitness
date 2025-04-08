import prisma from "../db/prismaClient.js";

export const getStats = async (req, res) => {
  const user_id = req.userId; // Get user_id from query parameter

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch user profile to get weight
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: parseInt(user_id) }, // Ensure we get the correct user profile
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Fetch workout plan items for the specific user
    const workoutPlanItems = await prisma.workoutPlanItem.findMany({
      where: {
        user_id: parseInt(user_id), // Filter by user_id
        status: "COMPLETED", // Filter by status
      },
      include: {
        activity: true, // Include the Activity data
        user: true, // Include the User data (if needed)
      },
    });

    // Format the response data
    const activitiesSummary = workoutPlanItems.reduce((acc, item) => {
      const activityName = item.activity.name;

      // Calculate calories per minute from calories per hour
      const caloriesPerMinute = item.activity.calories_per_kg / 60;

      // Calculate calories burned using user's weight and session duration in minutes
      const caloriesBurned = (
        userProfile.weight *
        caloriesPerMinute *
        item.duration
      ).toFixed(0); // Round to the nearest integer

      // Format session duration (in minutes)
      // Calculate session duration in hours and minutes
      const hours = Math.floor(item.duration / 60);
      const minutes = item.duration % 60;
      let sessionDuration = "";
      if (hours > 0) {
        sessionDuration += `${hours} hour(s) `;
      }
      if (minutes > 0) {
        sessionDuration += `${minutes} minute(s)`;
      }

      // Format date
      const date = new Date(item.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });

      // Prepare the activity object
      if (!acc[activityName]) {
        acc[activityName] = [];
      }

      // Push data for each workout plan item under its activity name
      acc[activityName].push({
        day: formattedDate.split(",")[0], // Extract day name (e.g., "Monday")
        date: formattedDate,
        sessionDuration: sessionDuration,
        caloriesBurned: `${caloriesBurned} kcal`,
      });

      return acc;
    }, {});

    // Return the formatted response
    res.status(200).json(activitiesSummary);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching activities." });
  }
};

// Helper function to get the start of the current week (Monday) in UTC
function getStartOfWeek() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const diff = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Get Monday's date
  const startOfWeek = new Date(now); // Create a new Date object to avoid mutating `now`
  startOfWeek.setUTCDate(diff);
  startOfWeek.setUTCHours(0, 0, 0, 0); // Set time to midnight
  return startOfWeek;
}

// Helper function to get the end of the current week (Sunday) in UTC
function getEndOfWeek() {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek); // Create a new Date object to avoid mutating `startOfWeek`
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Sunday is 6 days after Monday
  endOfWeek.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59
  return endOfWeek;
}

// Helper function to get the start of the last week (Monday of last week) in UTC
function getStartOfLastWeek() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // Get the day of the week in UTC
  const diff = now.getUTCDate() - dayOfWeek - 7 + (dayOfWeek === 0 ? -6 : 1); // Get last week's Monday

  // Create a new Date object to avoid modifying the original `now` object
  const startOfLastWeek = new Date(now); // Copy `now` to a new object
  startOfLastWeek.setUTCDate(diff);
  startOfLastWeek.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC
  return startOfLastWeek;
}

// Helper function to get the end of the previous week (Sunday of last week) in UTC
function getEndOfLastWeek() {
  const startOfLastWeek = getStartOfLastWeek();
  const endOfLastWeek = new Date(startOfLastWeek); // Create a new Date object based on start of last week
  endOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() + 6); // Sunday is 6 days after Monday
  endOfLastWeek.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59 in UTC
  return endOfLastWeek;
}

export const getDailyStats = async (req, res) => {
  const user_id = req.userId; // Get user_id from query parameter

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: parseInt(user_id) }, // Ensure we get the correct user profile
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Get the start and end of the current week
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    console.log(startOfWeek, endOfWeek);
    // const startOfLastWeek = getStartOfLastWeek();
    // const endOfLastWeek = getEndOfLastWeek();
    // Fetch workout plan items for the user in the current week
    const workoutPlanItems = await prisma.workoutPlanItem.findMany({
      where: {
        user_id: parseInt(user_id),
        status: "COMPLETED",
        date: {
          gte: startOfWeek, // Greater than or equal to start of week
          lte: endOfWeek, // Less than or equal to end of week
        },
      },
      include: {
        activity: true, // Include activity data to access its calories_per_kg
      },
    });
console.log(workoutPlanItems);
    // Prepare the result object
    const activitiesSummary = workoutPlanItems.reduce((acc, item) => {
      const activityName = item.activity.name;

      // Calculate calories burned per minute from calories per hour
      const caloriesPerMinute = item.activity.calories_per_kg / 60;

      // Calculate calories burned using user's weight and session duration in minutes
      const caloriesBurned = (
        userProfile.weight *
        caloriesPerMinute *
        item.duration
      ).toFixed(0); // Round to nearest integer
      //   console.log(
      //     caloriesBurned,
      //     userProfile.weight,
      //     caloriesPerMinute,
      //     item.duration
      //   );

      // Get the day of the week (e.g., "Monday", "Tuesday")
      const date = new Date(item.date);
      const dayOfWeek = date.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });

      // Initialize the activity array if it doesn't exist
      if (!acc[activityName]) {
        acc[activityName] = {
          name: activityName,
          caloriesPerDay: new Array(7).fill(0), // Array for 7 days of the week
        };
      }

      // Map days of the week to index (0: Monday, 1: Tuesday, ..., 6: Sunday)
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const dayIndex = daysOfWeek.indexOf(dayOfWeek);

      // Add the calories burned to the respective day of the week
      //   console.log(activityName, daysOfWeek[dayIndex], caloriesBurned);
      acc[activityName].caloriesPerDay[dayIndex] += parseInt(caloriesBurned);

      return acc;
    }, {});

    // Format the response to include only activity name and calories burned for each day
    const formattedSummary = Object.values(activitiesSummary).map(
      (activity) => ({
        [activity.name]: activity.caloriesPerDay,
      })
    );

    // Return the result
    res.status(200).json(formattedSummary);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching activities." });
  }
};
