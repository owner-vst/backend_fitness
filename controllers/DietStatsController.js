// import prisma from "../db/prismaClient.js";

// const getStartOfWeek = () => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + 1)); // Set to Monday
//   startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day
//   return startOfWeek;
// };

// const getEndOfWeek = () => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   const endOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek + 7)); // Set to Sunday
//   endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day
//   return endOfWeek;
// };

// // Function to fetch weekly progress stats for carbs, protein, and fats
// export const getWeeklyProgressStats = async (req, res) => {
//   const user_id = req.userId; // Get user_id from the authenticated user

//   if (!user_id) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     // Get the start and end of the current week
//     const startOfWeek = getStartOfWeek();
//     const endOfWeek = getEndOfWeek();

//     const startDate = new Date(startOfWeek);
//     startDate.setUTCHours(0, 0, 0, 0);

//     const endDate = new Date(endOfWeek);
//     endDate.setUTCHours(23, 59, 59, 999);
//     // Fetch DailyProgress data for the user for the current week
//     const dailyProgressItems = await prisma.dailyProgress.findMany({
//       where: {
//         user_id: parseInt(user_id),
//         date: {
//           // gte: startOfWeek, // Greater than or equal to start of the week
//           // lte: endOfWeek, // Less than or equal to end of the week
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//     });

//     // Prepare the result object for weekly stats (carbs, protein, fats, calories_intake, calories_burned)
//     const weeklyStats = {
//       carbs: new Array(7).fill(0), // Array for 7 days of the week (carbs)
//       protein: new Array(7).fill(0), // Array for 7 days of the week (protein)
//       fats: new Array(7).fill(0), // Array for 7 days of the week (fats)
//       caloriesIntake: new Array(7).fill(0), // Array for 7 days of the week (calories_intake)
//       caloriesBurned: new Array(7).fill(0), // Array for 7 days of the week (calories_burned)
//     };

//     // Iterate over daily progress data and accumulate the stats for each day
//     dailyProgressItems.forEach((item) => {
//       const date = new Date(item.date);
//       const dayOfWeek = date.getDay(); // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)

//       // Add the values to the respective day of the week
//       weeklyStats.carbs[dayOfWeek] += item.carbs_intake;
//       weeklyStats.protein[dayOfWeek] += item.protein_intake;
//       weeklyStats.fats[dayOfWeek] += item.fats_intake;
//       weeklyStats.caloriesIntake[dayOfWeek] += item.calories_intake;
//       weeklyStats.caloriesBurned[dayOfWeek] += item.calories_burned;
//     });

//     // Map days of the week (0: Sunday, 1: Monday, ..., 6: Saturday) to readable names
//     const daysOfWeek = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];

//     // Format the response
//     const formattedStats = daysOfWeek.map((day, index) => ({
//       day,
//       carbs: weeklyStats.carbs[index].toFixed(2), // Round to 2 decimal places
//       protein: weeklyStats.protein[index].toFixed(2),
//       fats: weeklyStats.fats[index].toFixed(2),
//       caloriesIntake: weeklyStats.caloriesIntake[index].toFixed(2),
//       caloriesBurned: weeklyStats.caloriesBurned[index].toFixed(2),
//     }));

//     // Return the result
//     res.status(200).json(formattedStats);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching weekly stats." });
//   }
// };
import prisma from "../db/prismaClient.js";

// Helper function to get the start of the current week (Monday) in UTC
// const getStartOfWeek = () => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   // Adjust for Monday start (0: Sunday, 1: Monday, ..., 6: Saturday)
//   const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Get Monday's date
//   const startOfWeek = new Date(today);
//   startOfWeek.setDate(diff);
//   startOfWeek.setHours(0, 0, 0, 0); // Set to midnight
//   return startOfWeek;
// };

// // Helper function to get the end of the current week (Sunday) in UTC
// const getEndOfWeek = () => {
//   const startOfWeek = getStartOfWeek();
//   const endOfWeek = new Date(startOfWeek);
//   endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday is 6 days after Monday
//   endOfWeek.setHours(23, 59, 59, 999); // Set to 11:59:59 PM
//   return endOfWeek;
// };
const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust so Monday is start
  const startOfWeek = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff)
  );
  startOfWeek.setUTCHours(0, 0, 0, 0);
  return startOfWeek;
};

// Get Sunday of the current week in UTC
const getEndOfWeek = () => {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  return endOfWeek;
};
// Function to fetch weekly progress stats for carbs, protein, and fats
export const getWeeklyProgressStats = async (req, res) => {
  const user_id = req.userId; // Get user_id from the authenticated user

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Get the start and end of the current week (Monday to Sunday)
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    // Set the correct UTC hours for accurate date filtering
    const startDate = new Date(startOfWeek);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(endOfWeek);
    endDate.setUTCHours(23, 59, 59, 999);

    // Fetch DailyProgress data for the user for the current week
    const dailyProgressItems = await prisma.dailyProgress.findMany({
      where: {
        user_id: parseInt(user_id),
        date: {
          gte: startDate, // Greater than or equal to start of the week
          lte: endDate, // Less than or equal to end of the week
        },
      },
    });

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

      // Adjust the day index to start from Monday (0 = Monday, ..., 6 = Sunday)
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Add the values to the respective day of the week
      weeklyStats.carbs[adjustedDayOfWeek] += item.carbs_intake;
      weeklyStats.protein[adjustedDayOfWeek] += item.protein_intake;
      weeklyStats.fats[adjustedDayOfWeek] += item.fats_intake;
      weeklyStats.caloriesIntake[adjustedDayOfWeek] += item.calories_intake;
      weeklyStats.caloriesBurned[adjustedDayOfWeek] += item.calories_burned;
    });

    // Map days of the week (0: Monday, 1: Tuesday, ..., 6: Sunday) to readable names
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
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
