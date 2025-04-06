import prisma from "../db/prismaClient.js";
import { z } from "zod";
import OpenAI from "openai";

export const createFoodCatalogueSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  calories: z.number().min(1, "Calories must be a positive number"),
  carbs: z.number().min(0, "Carbs must be a positive number"),
  protein: z.number().min(0, "Protein must be a positive number"),
  fats: z.number().min(0, "Fats must be a positive number"),
  serving_size_gm: z.number().min(1, "Serving size must be a positive number"),
  user_id: z.number().optional(),
});

export const createFoodCatalogue = async (req, res) => {
  let body;
  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createFoodCatalogueSchema.parse(body); // Zod schema validation

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
        user_id: parsedBody.user_id || null,
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
export const modifyFoodCatalogue = async (req, res) => {
  let body;
  const foodId = parseInt(req.params.foodId); // Get the food ID from the URL params

  try {
    body = await req.body;

    // Step 1: Validate body using Zod schema
    if (!body) {
      return res
        .status(400)
        .json({ message: "Request body is empty or malformed" });
    }

    const parsedBody = createFoodCatalogueSchema.parse(body); // Zod schema validation

    // Step 2: Check if Food exists by ID
    const foodExists = await prisma.foodCatalogue.findUnique({
      where: { id: foodId },
    });

    if (!foodExists) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Step 3: Update the Food item in the database
    const updatedFood = await prisma.foodCatalogue.update({
      where: { id: foodId }, // Use the ID from the URL params to find the food item
      data: {
        name: parsedBody.name || foodExists.name,
        calories: parsedBody.calories || foodExists.calories,
        carbs: parsedBody.carbs || foodExists.carbs,
        protein: parsedBody.protein || foodExists.protein,
        fats: parsedBody.fats || foodExists.fats,
        serving_size_gm:
          parsedBody.serving_size_gm || foodExists.serving_size_gm,
        user_id: parsedBody.user_id || foodExists.user_id, // If no user_id, keep the existing one
      },
    });

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const deleteFoodCatalogue = async (req, res) => {
  const foodId = parseInt(req.params.foodId); // Get the food ID from the URL params

  try {
    // Step 1: Validate the ID (check if it's a valid number)
    if (isNaN(foodId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid food ID" });
    }

    // Step 2: Check if Food exists by ID
    const foodExists = await prisma.foodCatalogue.findUnique({
      where: { id: foodId },
    });

    if (!foodExists) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Step 3: Delete the Food item from the database
    await prisma.foodCatalogue.delete({
      where: { id: foodId },
    });

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const getAllFoodCatalogue = async (req, res) => {
  try {
    // Step 1: Fetch all food items from the database
    const foods = await prisma.foodCatalogue.findMany();

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
export const getFoodCatalogueById = async (req, res) => {
  const foodId = parseInt(req.params.foodId); // Get the food ID from the URL params

  try {
    // Step 1: Fetch the food item from the database by ID
    const food = await prisma.foodCatalogue.findUnique({
      where: { id: foodId },
    });

    // Step 2: Check if the food item exists
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Step 3: Return the food item
    return res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    // Step 4: Handle any errors
    return res.status(400).json({ success: false, message: error.message });
  }
};
//diet plan items
const createDietPlanItemSchema = z.object({
  diet_plan_id: z.number().min(1, "Diet Plan ID is required"),
  meal_type: z.enum(
    ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
    "Invalid meal type"
  ),
  food_id: z.number().min(1, "Food ID is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than zero"),
  user_id: z.number().min(1, "User ID is required"), // Added user_id
  plan_type: z.enum(["AI", "USER"]).optional(), // Added plan_type
  date: z.string().datetime(), // Date as string in datetime format
  created_by_id: z.number().min(1, "Created By ID is required"), // Added created_by_id
});

export const createDietPlanItem = async (req, res) => {
  const { body } = req;

  try {
    // Validate request body using Zod
    const parsedBody = createDietPlanItemSchema.parse(body);

    // Create new DietPlanItem
    const dietPlanItem = await prisma.dietPlanItem.create({
      data: {
        diet_plan_id: parsedBody.diet_plan_id,
        meal_type: parsedBody.meal_type,
        food_id: parsedBody.food_id,
        quantity: parsedBody.quantity,
        user_id: parsedBody.user_id,
        plan_type: parsedBody.plan_type || "USER", // Default to "USER" if not provided
        date: parsedBody.date,
        created_by_id: parsedBody.created_by_id,
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

const updateDietPlanItemSchema = z.object({
  meal_type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
  food_id: z.number().min(1, "Food ID is required").optional(),
  quantity: z
    .number()
    .min(0.1, "Quantity must be greater than zero")
    .optional(),
  status: z.enum(["PENDING", "COMPLETED", "SKIPPED"]).optional(),
  user_id: z.number().min(1, "User ID is required").optional(),
  plan_type: z.enum(["AI", "USER"]).optional(),
  date: z.string().datetime().optional(),
  created_by_id: z.number().min(1, "Created By ID is required").optional(),
});

export const updateDietPlanItem = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Validate request body using Zod
    const parsedBody = updateDietPlanItemSchema.parse(body);

    // Find the DietPlanItem by ID
    const dietPlanItem = await prisma.dietPlanItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dietPlanItem) {
      return res.status(404).json({
        success: false,
        message: "Diet Plan Item not found",
      });
    }

    // Update the DietPlanItem
    const updatedDietPlanItem = await prisma.dietPlanItem.update({
      where: { id: parseInt(id) },
      data: {
        meal_type: parsedBody.meal_type || dietPlanItem.meal_type,
        food_id: parsedBody.food_id || dietPlanItem.food_id,
        quantity: parsedBody.quantity || dietPlanItem.quantity,
        status: parsedBody.status || dietPlanItem.status,
        user_id: parsedBody.user_id || dietPlanItem.user_id,
        plan_type: parsedBody.plan_type || dietPlanItem.plan_type,
        date: parsedBody.date || dietPlanItem.date,
        created_by_id: parsedBody.created_by_id || dietPlanItem.created_by_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Diet Plan Item updated successfully",
      dietPlanItem: updatedDietPlanItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDietPlanItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the DietPlanItem by ID
    const dietPlanItem = await prisma.dietPlanItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dietPlanItem) {
      return res.status(404).json({
        success: false,
        message: "Diet Plan Item not found",
      });
    }

    // Delete the DietPlanItem
    await prisma.dietPlanItem.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Diet Plan Item deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewDietPlanItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the DietPlanItem by ID and include related data (food details)
    const dietPlanItem = await prisma.dietPlanItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        food: true, // Include related food details
        diet_plan: true, // Include related diet plan details
      },
    });

    if (!dietPlanItem) {
      return res.status(404).json({
        success: false,
        message: "Diet Plan Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      dietPlanItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDietPlanItems = async (req, res) => {
  try {
    // Fetch all DietPlanItems
    const dietPlanItems = await prisma.dietPlanItem.findMany({
      include: {
        food: true, // Include related food details
        diet_plan: true, // Include related diet plan details
      },
    });

    return res.status(200).json({
      success: true,
      dietPlanItems,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchSuggestedDietPlan = async (req, res) => {
  try {
    // const suggestedDietPlan = await prisma.dietPlan.findMany({
    //   where: {
    //     user_id: req.userId,
    //   },
    //   include: {
    //     items: true,
    //   },
    // });

    const food_items = await prisma.foodCatalogue.findMany();
    let diet_planId = await getOrCreateDietPlan(req.userId);
    diet_planId = diet_planId.planId;
    const calories = await calculateCalories(req.userId);
    const goal = calories.goal;
    const calories_intake = calories.dailyCalories;
    console.log(calories_intake);
    const calories_burned = calories.caloriesToBurn;
    const planItems = await getDietPlanItems(req.userId, diet_planId);
    const formattedFoodItems = food_items.map((item) => ({
      id: item.id,
      name: item.name,
      calories: item.calories,
    }));
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4o",
      instructions: `You are a Professional Diet Planner.\
        Your task is to suggest a diet plan based on the user's preferences and goals.\
        You should provide a detailed breakdown of the meals, including the food items, quantity, and calories.\
        You should also include any necessary modifications or substitutions to ensure the user's dietary needs are met.\
        The plan should be presented in a clear and concise manner, with a focus on the user's goals and preferences.\
        Please ensure that the plan is realistic and achievable, and that it aligns with the user's values and priorities.\

        Diet Plan Items:\
        -${planItems.length > 0 ? planItems : "No diet plan items found"}\

        User Preferences:\
        - User is looking to reach goal ${goal}.\
        - User prefers whole foods, fruits, and vegetables.\
        - User enjoys moderate to high protein intake.\
        - User is looking for a balanced and nutritious diet.\
        - User will have all 4 types of meals (meal_type - BREAKFAST,LUNCH,DINNER,SNACK) and the quantity of food items.\
        - If there are any missing diet plan items for any 'meal_type', then send ONLY the missing plan items in the response.\
        - Foreach meal type user will have only one food item.\
        - User should intake ${calories_intake} calories per day\
        - The sum of all calories in suggest plan should be ${calories_intake} calories and caluculate this calories by fooditem.calories*(dietplan_item.quantity/100)
        -Strictly follow the provided instructions and format for output.\

       
        Food Items Catalogue:\
        - ${JSON.stringify(formattedFoodItems)}\
        - So the output Json should be like this:\
        
        Sample Response :\
        {
          diet_plan: {
          "BREAKFAST": 
          {
            "diet_plan_id": ${diet_planId},
            "meal_type": "BREAKFAST",
            "food_id": 1,
            "quantity": 1,
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}",
            "created_by_id": 1,
            "status": "PENDING",
          },
          "LUNCH":
          {
            "diet_plan_id": ${diet_planId},
            "meal_type": "LUNCH",
            "food_id": 2,
            "quantity": 350,
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}",
            "created_by_id": 1,
            "status": "PENDING",
          },
          "DINNER":
          {
            "diet_plan_id": ${diet_planId},
            "meal_type": "DINNER",
            "food_id": 3,
            "quantity": 450,
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}",
            "created_by_id": 1,
            "status": "PENDING",
          },
          "SNACK":
          {
            "diet_plan_id": ${diet_planId},
            "meal_type": "SNACK",
            "food_id": 4,
            "quantity": 200,
            "user_id": ${req.userId},
            "plan_type": "AI",
            "date": "${new Date().toISOString()}",
            "created_by_id": 1,
            "status": "PENDING",
          },                   
    }, 
      }\

        Instructions:\
        1. STRICTLY follow the provided instructions and format based on sample response.\
        2. Do not include any additional text or explanations.\
        3. Ensure that the output is a valid JSON object.\
        4. Do not include any additional fields or properties.\
        5. Do not include any additional food items or variations.\
        6. Do not include any food items that are not in the catalogue.\
        `,
      input:
        "Suggest a diet plan for a user by following the instructions\
      and following the format, and return the diet plan items which are missing\
      for the user",
    });
    const outputText = response.output_text;
    let cleanedResponse = outputText
      .replace(/```json/g, "")
      .replace(/```/g, "");
    cleanedResponse = cleanedResponse
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .replace(/\t/g, "");

    const dietPlan = JSON.parse(cleanedResponse);
    await createMultipleDietPlanItemsHelper(dietPlan, diet_planId);
    return res.status(200).json({
      success: true,
      suggestedDietPlan: dietPlan,
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize the date to start of the UTC day

    // Calculate the end of the day in UTC
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of the UTC day

    // Check if there's an existing plan for the user today (in UTC)
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: today, // Greater than or equal to the start of today
          lt: endOfDay, // Less than the start of the next day
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
        date: today, // Set date to the UTC start of the day
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

export const getOrCreateDietPlan = async (userId) => {
  try {
    // Get the current date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize the date to start of the UTC day

    // Calculate the end of the day in UTC
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of the UTC day

    // Check if there's an existing plan for the user today (in UTC)
    const existingPlan = await prisma.dietPlan.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: today, // Greater than or equal to the start of today
          lt: endOfDay, // Less than the start of the next day
        },
      },
    });

    // If the plan already exists for today, return the plan ID
    if (existingPlan) {
      return { planId: existingPlan.id };
    }

    // If no plan exists, create a new diet plan for the user
    const newPlan = await prisma.dietPlan.create({
      data: {
        user_id: userId,
        date: today, // Set date to the UTC start of the day
        // You can add other default fields like created_at if needed
      },
    });

    // Return the new plan ID
    return { planId: newPlan.id };
  } catch (error) {
    console.error("Error fetching or creating diet plan:", error);
    throw new Error("Something went wrong while handling the diet plan.");
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
      caloriesToBurn = 0; // For maintenance, we don't need to burn extra
    } else if (goal.toLowerCase() === "lose") {
      dailyCalories = TDEE - 500;
      caloriesToBurn = 500; // Suggested 500-calorie deficit to burn for weight loss
    } else if (goal.toLowerCase() === "gain") {
      dailyCalories = TDEE + 500;
      caloriesToBurn = 0; // For weight gain, burning extra calories isn't prioritized
    } else {
      throw new Error("Invalid goal. Use 'gain', 'lose', or 'maintain'.");
    }

    // Return the calculated values as an object
    return {
      BMR,
      TDEE,
      goal,
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

export const getDietPlanItems = async (userId, planId) => {
  try {
    console.log(userId, planId);
    const planItems = await prisma.dietPlanItem.findMany({
      where: {
        user_id: userId,
        diet_plan_id: planId.planId,
      },
    });
    return planItems;
  } catch (error) {
    console.error("Error getting diet plan items:", error.message);
    throw new Error("Internal server error");
  }
};

export const createMultipleDietPlanItems = async (req, res) => {
  const { body } = req;

  try {
    // Validate request body using Zod
    const parsedBody = createDietPlanItemSchema.parse(body);

    // Log parsed body to debug
    console.log("Parsed body:", parsedBody);

    // Prepare data for the diet plan items
    const dietPlanItems = [
      {
        diet_plan_id: parsedBody.diet_plan_id,
        meal_type: "BREAKFAST",
        food_id: 1,
        quantity: 100,
        user_id: parsedBody.user_id, // Ensure user_id is passed correctly
        plan_type: "AI",
        date: new Date().toISOString(),
        created_by_id: parsedBody.created_by_id, // Ensure created_by_id is passed correctly
        status: "PENDING",
      },
      {
        diet_plan_id: parsedBody.diet_plan_id,
        meal_type: "LUNCH",
        food_id: 2,
        quantity: 1,
        user_id: parsedBody.user_id,
        plan_type: "AI",
        date: new Date().toISOString(),
        created_by_id: parsedBody.created_by_id,
        status: "PENDING",
      },
      {
        diet_plan_id: parsedBody.diet_plan_id,
        meal_type: "DINNER",
        food_id: 3,
        quantity: 200,
        user_id: parsedBody.user_id,
        plan_type: "AI",
        date: new Date().toISOString(),
        created_by_id: parsedBody.created_by_id,
        status: "PENDING",
      },
      {
        diet_plan_id: parsedBody.diet_plan_id,
        meal_type: "SNACK",
        food_id: 4,
        quantity: 150,
        user_id: parsedBody.user_id,
        plan_type: "AI",
        date: new Date().toISOString(),
        created_by_id: parsedBody.created_by_id,
        status: "PENDING",
      },
    ];

    // Create multiple DietPlanItems in a single query
    const dietPlanItemsCreated = await prisma.dietPlanItem.createMany({
      data: dietPlanItems,
    });

    return res.status(201).json({
      success: true,
      message: "Diet Plan Items created successfully",
      dietPlanItems: dietPlanItemsCreated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const createMultipleDietPlanItemsHelper = async (
  parsedBody,
  diet_planId
) => {
  console.log("parsedBody", parsedBody);
  console.log("diet_planId", diet_planId);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    // Fetch the existing diet plan items from the database for comparison
    const existingDietPlans = await prisma.dietPlanItem.findMany({
      where: {
        diet_plan_id: diet_planId, // Assuming you pass diet_plan_id to filter existing plans
        user_id: parsedBody.user_id, // Filter based on user if necessary
      },
    });
    console.log("existingDietPlans", existingDietPlans);
    // Extract existing meal types from the database
    const existingMealTypes = existingDietPlans.map((item) => item.meal_type);

    // Prepare data for missing meal types only
    const dietPlanItems = [];

    // Iterate through the parsedBody diet_plan object and check if each meal_type already exists
    for (let item of Object.values(parsedBody.diet_plan)) {
      // Check if the meal_type is already present in the existing database
      if (!existingMealTypes.includes(item.meal_type)) {
        // If not, create the new item to insert into the database
        const newItem = {
          diet_plan_id: item.diet_plan_id,
          meal_type: item.meal_type,
          food_id: item.food_id,
          quantity: item.quantity,
          user_id: item.user_id,
          plan_type: item.plan_type || "AI", // Default "AI" if missing
          date: today.toISOString(),
          created_by_id: item.created_by_id,
          status: item.status || "PENDING", // Default "PENDING" if missing
        };

        // Add missing item to the dietPlanItems array
        dietPlanItems.push(newItem);
      }
    }

    console.log("dietPlanItems to be created:", dietPlanItems);

    // If there are missing diet plan items, insert them into the database
    if (dietPlanItems.length > 0) {
      const dietPlanItemsCreated = await prisma.dietPlanItem.createMany({
        data: dietPlanItems,
      });

      // Return success message with created diet plan items
      return {
        success: true,
        message: "Missing Diet Plan Items created successfully",
        dietPlanItems: dietPlanItemsCreated,
      };
    } else {
      // If there are no missing items, return a message indicating that
      return {
        success: true,
        message: "All diet plan items already exist in the database",
      };
    }
  } catch (error) {
    console.error("Error creating diet plan items:", error);
    throw new Error(error.message);
  }
};
