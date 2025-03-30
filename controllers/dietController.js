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

    const client = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"],
    });

    const response = await client.responses.create({
      model: "gpt-4o",
      instructions:
        `You are a Professional Diet Planner.\
        Your task is to suggest a diet plan based on the user's preferences and goals.\
        You should provide a detailed breakdown of the meals, including the food items, quantity, and calories.\
        You should also include any necessary modifications or substitutions to ensure the user's dietary needs are met.\
        The plan should be presented in a clear and concise manner, with a focus on the user's goals and preferences.\
        Please ensure that the plan is realistic and achievable, and that it aligns with the user's values and priorities.\
        User Preferences:\
        - User is looking to lose weight and maintain a healthy weight.\
        - User prefers whole foods, fruits, and vegetables.\
        - User enjoys moderate to high protein intake.\
        - User is looking for a balanced and nutritious diet.\
        Food Items Catalogue:\
        - ${food_items}\
        Output Format (JSON):\
        {
          diet_plan: {
            "breakfast": [
              {
                "food": "apple",
                "quantity": 1,
                "calories": 100
              },
              {
                "food": "banana",
                "quantity": 1,
                "calories": 100
              }
            ],
            "lunch": [
              {
                "food": "chicken",
                "quantity": 1,
                "calories": 100
              },
              {
                "food": "avocado",
                "quantity": 1,
                "calories": 100
              }
            ],
            "dinner": [
              {
                "food": "salmon",
                "quantity": 1,
                "calories": 100
              },
              {
                "food": "sweet potato",
                "quantity": 1,
                "calories": 100
              }
            ],
            "snacks": [
              {
                "food": "carrot",
                "quantity": 1,
                "calories": 100
              },
              {
                "food": "almond",
                "quantity": 1,
                "calories": 100
              }
            ]
          },
          food_log: {
            "breakfast": [
              {
                "food": "apple",
                "quantity": 1,
                "calories": 100
              },
              {
                "food": "banana",
                "quantity": 1,
                "calories": 100
              }
            ],
          }
        }\
        Instructions:\
        1. Strictly follow the provided instructions and format.\
        2. Do not include any additional text or explanations.\
        3. Ensure that the output is a valid JSON object.\
        4. Do not include any additional fields or properties.\
        5. Do not include any additional food items or variations.\
        6. Do not include any food items that are not in the catalogue.\
        `, 
      input: "Are semicolons optional in JavaScript?",
    });

    return res.status(200).json({
      success: true,
      suggestedDietPlan: response,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
