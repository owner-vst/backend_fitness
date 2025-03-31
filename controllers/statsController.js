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
