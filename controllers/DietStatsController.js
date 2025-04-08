import prisma from "../db/prismaClient.js";

const getStartOfWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + 1)); // Set to Monday
  startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day
  return startOfWeek;
};

const getEndOfWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const endOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + 7)); // Set to Sunday
  endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day
  return endOfWeek;
};

// Function to fetch weekly progress stats for carbs, protein, and fats
export const getWeeklyProgressStats = async (req, res) => {
  const user_id = req.userId; // Get user_id from the authenticated user

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Get the start and end of the current week
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    console.log(startOfWeek, endOfWeek);

    // Fetch DailyProgress data for the user for the current week
    const dailyProgressItems = await prisma.dailyProgress.findMany({
      where: {
        user_id: parseInt(user_id),
        date: {
          gte: startOfWeek, // Greater than or equal to start of the week
          lte: endOfWeek, // Less than or equal to end of the week
        },
      },
    });
    console.log(dailyProgressItems);

    // Prepare the result object for weekly stats (carbs, protein, fats, calories_intake, calories_burned)
    const weeklyStats = {
      carbs: new Array(7).fill(0), // Array for 7 days of the week (carbs)
      protein: new Array(7).fill(0), // Array for 7 days of the week (protein)
      fats: new Array(7).fill(0), // Array for 7 days of the week (fats)
      caloriesIntake: new Array(7).fill(0), // Array for 7 days of the week (calories_intake)
      caloriesBurned: new Array(7).fill(0), // Array for 7 days of the week (calories_burned)
    };

    // Iterate over daily progress data and accumulate the stats for each day
    dailyProgressItems.forEach((item) => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)

      // Add the values to the respective day of the week
      weeklyStats.carbs[dayOfWeek] += item.carbs_intake;
      weeklyStats.protein[dayOfWeek] += item.protein_intake;
      weeklyStats.fats[dayOfWeek] += item.fats_intake;
      weeklyStats.caloriesIntake[dayOfWeek] += item.calories_intake;
      weeklyStats.caloriesBurned[dayOfWeek] += item.calories_burned;
    });

    // Map days of the week (0: Sunday, 1: Monday, ..., 6: Saturday) to readable names
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Format the response
    const formattedStats = daysOfWeek.map((day, index) => ({
      day,
      carbs: weeklyStats.carbs[index].toFixed(2), // Round to 2 decimal places
      protein: weeklyStats.protein[index].toFixed(2),
      fats: weeklyStats.fats[index].toFixed(2),
      caloriesIntake: weeklyStats.caloriesIntake[index].toFixed(2),
      caloriesBurned: weeklyStats.caloriesBurned[index].toFixed(2),
    }));

    // Return the result
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching weekly stats." });
  }
};
