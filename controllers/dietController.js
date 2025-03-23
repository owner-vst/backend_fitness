import prisma from "../db/prismaClient.js";
import { z } from "zod";

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
    // Fetch all DietPlanItems for a specific diet plan
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

//diel log
const createFoodLogSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  food_id: z.number().min(1, "Food ID is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  date: z.string().datetime(),
});

// Schema for updating a FoodLog entry
const updateFoodLogSchema = z.object({
  quantity: z.number().min(0.1, "Quantity must be greater than 0").optional(),
  date: z.string().datetime().optional(),
});

// Create a new food log
export const createFoodLog = async (req, res) => {
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = createFoodLogSchema.parse(body);

    // Create the food log entry
    const foodLog = await prisma.foodLog.create({
      data: {
        user_id: parsedBody.user_id,
        food_id: parsedBody.food_id,
        quantity: parsedBody.quantity,
        date: new Date(parsedBody.date),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Food log created successfully",
      foodLog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a food log entry
export const updateFoodLog = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = updateFoodLogSchema.parse(body);

    // Find the food log entry by ID
    const foodLog = await prisma.foodLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        message: "Food log not found",
      });
    }

    // Update the food log entry
    const updatedFoodLog = await prisma.foodLog.update({
      where: { id: parseInt(id) },
      data: {
        quantity: parsedBody.quantity || foodLog.quantity,
        date: parsedBody.date ? new Date(parsedBody.date) : foodLog.date,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Food log updated successfully",
      foodLog: updatedFoodLog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a food log entry
export const deleteFoodLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the food log entry by ID
    const foodLog = await prisma.foodLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        message: "Food log not found",
      });
    }

    // Delete the food log entry
    await prisma.foodLog.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Food log deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// View a specific food log entry
export const viewFoodLog = async (req, res) => {
  const { id } = req.params;

  try {
    const foodLog = await prisma.foodLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        food: true, // Include related food details
        user: true, // Include related user details
      },
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        message: "Food log not found",
      });
    }

    return res.status(200).json({
      success: true,
      foodLog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all food logs for a specific user
export const getAllFoodLogsforUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing userId",
    });
  }

  try {
    // Fetch all food logs for the given user
    const foodLogs = await prisma.foodLog.findMany({
      where: { user_id: parseInt(userId) }, // Convert to integer
      include: {
        food: true, // Include related food details
        user: true, // Include related user details
      },
    });

    return res.status(200).json({
      success: true,
      foodLogs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllFoodLogs = async (req, res) => {
  try {
    // Fetch all food logs for the given user
    const foodLogs = await prisma.foodLog.findMany({
      include: {
        food: true, // Include related food details
        user: true, // Include related user details
      },
    });

    return res.status(200).json({
      success: true,
      foodLogs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
