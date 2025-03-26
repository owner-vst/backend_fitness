import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed Roles
  const roles = await prisma.role.createMany({
    data: [
      { role_name: "ADMIN" },
      { role_name: "VENDOR" },
      { role_name: "USER" },
    ],
  });

  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      {
        first_name: "Alice",
        last_name: "Smith",
        name: "Alice Smith",
        email: "alice@example.com",
        dob: new Date("1990-01-01"),
        gender: "Female",
        password_hash: "hash1",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 1,
        status: "ACTIVE",
      },
      {
        first_name: "Bob",
        last_name: "Johnson",
        name: "Bob Johnson",
        email: "bob@example.com",
        dob: new Date("1985-02-02"),
        gender: "Male",
        password_hash: "hash2",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 2,
        status: "ACTIVE",
      },
      {
        first_name: "Charlie",
        last_name: "Brown",
        name: "Charlie Brown",
        email: "charlie@example.com",
        dob: new Date("1992-03-03"),
        gender: "Other",
        password_hash: "hash3",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 3,
        status: "ACTIVE",
      },
      {
        first_name: "David",
        last_name: "Wilson",
        name: "David Wilson",
        email: "david@example.com",
        dob: new Date("1988-04-04"),
        gender: "Male",
        password_hash: "hash4",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 2,
        status: "ACTIVE",
      },
      {
        first_name: "Eve",
        last_name: "Taylor",
        name: "Eve Taylor",
        email: "eve@example.com",
        dob: new Date("1995-05-05"),
        gender: "Female",
        password_hash: "hash5",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 3,
        status: "ACTIVE",
      },
      {
        first_name: "Frank",
        last_name: "Adams",
        name: "Frank Adams",
        email: "tolota2225@doishy.com",
        dob: new Date("1995-05-05"),
        gender: "Female",
        password_hash:
          "$2b$10$ROFhDz7nYnk44uOSNBseVupi2x0Oxglg6HigKFA608CcJukqAVgDO",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 3,
        status: "ACTIVE",
      },
      {
        first_name: "John",
        last_name: "Doe",
        name: "John Doe",
        email: "moxaro7286@avulos.com",
        dob: new Date("1995-05-05"),
        gender: "Female",
        password_hash:
          "$2b$10$v/lT5rsCczV0kO.fL.KKZuIyGO67Qh1ghgoBzOPlCEI2nqCy0R5Iu",
        created_at: new Date(),
        updated_at: new Date(),
        role_id: 1,
        status: "ACTIVE",
      },
    ],
  });

  // Seed Permissions
  const permissions = await prisma.permission.createMany({
    data: [
      { role_id: 1, permission: "CREATE_USER" },
      { role_id: 1, permission: "DELETE_USER" },
      { role_id: 1, permission: "MODIFY_USER" },
      { role_id: 1, permission: "VIEW_USERS" },
      { role_id: 1, permission: "VIEW_ORDERS" },
      { role_id: 1, permission: "CREATE_ORDER" },
      { role_id: 1, permission: "DELETE_ORDER" },
      { role_id: 1, permission: "MODIFY_ORDER" },
      { role_id: 1, permission: "VIEW_PRODUCTS" },
      { role_id: 1, permission: "CREATE_PRODUCT" },
      { role_id: 1, permission: "DELETE_PRODUCT" },
      { role_id: 1, permission: "MODIFY_PRODUCT" },
      { role_id: 1, permission: "VIEW_FOOD_ITEMS" },
      { role_id: 1, permission: "CREATE_FOOD_ITEM" },
      { role_id: 1, permission: "DELETE_FOOD_ITEM" },
      { role_id: 1, permission: "MODIFY_FOOD_ITEM" },
      { role_id: 1, permission: "VIEW_DIET_PLAN" },
      { role_id: 1, permission: "CREATE_DIET_PLAN" },
      { role_id: 1, permission: "DELETE_DIET_PLAN" },
      { role_id: 1, permission: "MODIFY_DIET_PLAN" },
      { role_id: 1, permission: "VIEW_DIET_ITEMS" },
      { role_id: 1, permission: "CREATE_DIET_ITEM" },
      { role_id: 1, permission: "DELETE_DIET_ITEM" },
      { role_id: 1, permission: "MODIFY_DIET_ITEM" },
      { role_id: 1, permission: "VIEW_DIET_LOG" },
      { role_id: 1, permission: "CREATE_DIET_LOG" },
      { role_id: 1, permission: "DELETE_DIET_LOG" },
      { role_id: 1, permission: "MODIFY_DIET_LOG" },
      { role_id: 1, permission: "VIEW_ACTIVITY" },
      { role_id: 1, permission: "CREATE_ACTIVITY" },
      { role_id: 1, permission: "DELETE_ACTIVITY" },
      { role_id: 1, permission: "MODIFY_ACTIVITY" },
      { role_id: 1, permission: "VIEW_WORKOUT_PLAN" },
      { role_id: 1, permission: "CREATE_WORKOUT_PLAN" },
      { role_id: 1, permission: "DELETE_WORKOUT_PLAN" },
      { role_id: 1, permission: "MODIFY_WORKOUT_PLAN" },
      { role_id: 1, permission: "VIEW_WORKOUT_ITEMS" },
      { role_id: 1, permission: "CREATE_WORKOUT_ITEM" },
      { role_id: 1, permission: "DELETE_WORKOUT_ITEM" },
      { role_id: 1, permission: "MODIFY_WORKOUT_ITEM" },
      { role_id: 1, permission: "VIEW_WORKOUT_LOG" },
      { role_id: 1, permission: "CREATE_WORKOUT_LOG" },
      { role_id: 1, permission: "DELETE_WORKOUT_LOG" },
      { role_id: 1, permission: "MODIFY_WORKOUT_LOG" },
      { role_id: 1, permission: "VIEW_DASHBOARD_STATS" },
      { role_id: 1, permission: "VIEW_WORKOUT_STATS" },
      { role_id: 1, permission: "SEND_MESSAGE" },
      { role_id: 1, permission: "GET_MESSAGE" },
      { role_id: 1, permission: "UPDATE_PROFILE" },
      { role_id: 2, permission: "VIEW_ORDERS" },
      { role_id: 2, permission: "CREATE_ORDER" },
      { role_id: 2, permission: "DELETE_ORDER" },
      { role_id: 2, permission: "MODIFY_ORDER" },
      { role_id: 2, permission: "VIEW_PRODUCTS" },
      { role_id: 2, permission: "CREATE_PRODUCT" },
      { role_id: 2, permission: "DELETE_PRODUCT" },
      { role_id: 2, permission: "MODIFY_PRODUCT" },
      { role_id: 2, permission: "VIEW_DIET_PLAN" },
      { role_id: 2, permission: "CREATE_DIET_PLAN" },
      { role_id: 2, permission: "VIEW_FOOD_ITEMS" },
      { role_id: 2, permission: "CREATE_FOOD_ITEM" },
      { role_id: 2, permission: "VIEW_WORKOUT_PLAN" },
      { role_id: 2, permission: "CREATE_WORKOUT_PLAN" },
      { role_id: 2, permission: "VIEW_DIET_ITEMS" },
      { role_id: 2, permission: "MODIFY_DIET_ITEM" },
      { role_id: 2, permission: "VIEW_WORKOUT_ITEMS" },
      { role_id: 2, permission: "MODIFY_WORKOUT_ITEM" },
      { role_id: 2, permission: "VIEW_ACTIVITY" },
      { role_id: 2, permission: "CREATE_ACTIVITY" },
      { role_id: 2, permission: "VIEW_DIET_LOG" },
      { role_id: 2, permission: "CREATE_DIET_LOG" },
      { role_id: 2, permission: "DELETE_DIET_LOG" },
      { role_id: 2, permission: "MODIFY_DIET_LOG" },
      { role_id: 2, permission: "VIEW_WORKOUT_LOG" },
      { role_id: 2, permission: "CREATE_WORKOUT_LOG" },
      { role_id: 2, permission: "DELETE_WORKOUT_LOG" },
      { role_id: 2, permission: "MODIFY_WORKOUT_LOG" },
      { role_id: 2, permission: "VIEW_DASHBOARD_STATS" },
      { role_id: 2, permission: "VIEW_WORKOUT_STATS" },
      { role_id: 2, permission: "SEND_MESSAGE" },
      { role_id: 2, permission: "GET_MESSAGE" },
      { role_id: 2, permission: "UPDATE_PROFILE" },
      { role_id: 3, permission: "VIEW_FOOD_ITEMS" },
      { role_id: 3, permission: "CREATE_FOOD_ITEM" },
      { role_id: 3, permission: "VIEW_DIET_PLAN" },
      { role_id: 3, permission: "CREATE_DIET_PLAN" },
      { role_id: 3, permission: "VIEW_DIET_ITEMS" },
      { role_id: 3, permission: "MODIFY_DIET_ITEM" },
      { role_id: 3, permission: "VIEW_WORKOUT_PLAN" },
      { role_id: 3, permission: "CREATE_WORKOUT_PLAN" },
      { role_id: 3, permission: "VIEW_WORKOUT_ITEMS" },
      { role_id: 3, permission: "MODIFY_WORKOUT_ITEM" },
      { role_id: 3, permission: "VIEW_ACTIVITY" },
      { role_id: 3, permission: "CREATE_ACTIVITY" },
      { role_id: 3, permission: "VIEW_DIET_LOG" },
      { role_id: 3, permission: "CREATE_DIET_LOG" },
      { role_id: 3, permission: "DELETE_DIET_LOG" },
      { role_id: 3, permission: "MODIFY_DIET_LOG" },
      { role_id: 3, permission: "VIEW_WORKOUT_LOG" },
      { role_id: 3, permission: "CREATE_WORKOUT_LOG" },
      { role_id: 3, permission: "DELETE_WORKOUT_LOG" },
      { role_id: 3, permission: "MODIFY_WORKOUT_LOG" },
      { role_id: 3, permission: "VIEW_DASHBOARD_STATS" },
      { role_id: 3, permission: "VIEW_WORKOUT_STATS" },
      { role_id: 3, permission: "SEND_MESSAGE" },
      { role_id: 3, permission: "GET_MESSAGE" },
      { role_id: 3, permission: "UPDATE_PROFILE" },
    ],
  });

  // Seed UserProfiles
  const userProfiles = await prisma.userProfile.createMany({
    data: [
      {
        user_id: 1,
        height: 160,
        weight: 60,
        blood_group: "A_POSITIVE",
        activity_type: "MODERATE",
        goal: "MAINTAIN",
      },
      {
        user_id: 2,
        height: 170,
        weight: 70,
        blood_group: "B_POSITIVE",
        activity_type: "ACTIVE",
        goal: "GAIN",
      },
      {
        user_id: 3,
        height: 180,
        weight: 80,
        blood_group: "O_POSITIVE",
        activity_type: "LAZY",
        goal: "LOSE",
      },
      {
        user_id: 4,
        height: 175,
        weight: 75,
        blood_group: "AB_POSITIVE",
        activity_type: "SPORTS_PERSON",
        goal: "MAINTAIN",
      },
      {
        user_id: 5,
        height: 165,
        weight: 65,
        blood_group: "A_NEGATIVE",
        activity_type: "MODERATE",
        goal: "GAIN",
      },
      {
        user_id: 6,
        height: 155,
        weight: 55,
        blood_group: "B_NEGATIVE",
        activity_type: "ACTIVE",
        goal: "LOSE",
      },
      {
        user_id: 7,
        height: 185,
        weight: 85,
        blood_group: "O_NEGATIVE",
        activity_type: "LAZY",
        goal: "MAINTAIN",
      },
    ],
  });

  // Seed Activities
  const activities = await prisma.activity.createMany({
    data: [
      {
        name: "Running",
        duration: 60, // in min
        calories_per_kg: 8, // Calories burned per kg per hour
      },
      {
        name: "Swimming",
        duration: 60, // in min
        calories_per_kg: 7.5, // Calories burned per kg per hour
      },
      {
        name: "Cycling",
        duration: 60, // in min
        calories_per_kg: 6.5, // Calories burned per kg per hour
      },
      {
        name: "Yoga",
        duration: 60, // in min
        calories_per_kg: 3, // Calories burned per kg per hour
      },
      {
        name: "Weightlifting",
        duration: 60, // in min
        calories_per_kg: 6, // Calories burned per kg per hour
      },
    ],
  });

  // Seed WorkoutPlans
  const workoutPlans = await prisma.workoutPlan.createMany({
    data: [
      {
        user_id: 1, // Example user ID
        start_date: new Date("2025-03-01"),
        end_date: new Date("2025-03-31"),
        created_at: new Date(),
      },
      {
        user_id: 2, // Example user ID
        start_date: new Date("2025-04-01"),
        end_date: new Date("2025-04-30"),
        created_at: new Date(),
      },
      {
        user_id: 7, // Example user ID
        start_date: new Date("2025-05-01"),
        end_date: new Date("2025-05-31"),
        created_at: new Date(),
      },
    ],
  });

  // Seed WorkoutPlanItems
  const workoutPlanItems = await prisma.workoutPlanItem.createMany({
    data: [
      {
        workout_plan_id: 1, // Example workout plan ID
        activity_id: 1, // Example activity ID (Running)
        duration: 60, //in min
      },
      {
        workout_plan_id: 1, // Example workout plan ID
        activity_id: 2, // Example activity ID (Swimming)
        duration: 30, //in min
      },
      {
        workout_plan_id: 1, // Example workout plan ID
        activity_id: 3, // Example activity ID (Cycling)
        duration: 30, //in min
      },
      {
        workout_plan_id: 2, // Example workout plan ID
        activity_id: 4, // Example activity ID (Yoga)
        duration: 15, //in min
      },
      {
        workout_plan_id: 2, // Example workout plan ID
        activity_id: 5, // Example activity ID (Weightlifting)
        duration: 20, //in min
      },
      {
        workout_plan_id: 2, // Example workout plan ID
        activity_id: 1, // Example activity ID (Running)
        duration: 10, //in min
      },
      {
        workout_plan_id: 3, // Example workout plan ID
        activity_id: 2, // Example activity ID (Swimming)
        duration: 30, //in min
      },
      {
        workout_plan_id: 3, // Example workout plan ID
        activity_id: 3, // Example activity ID (Cycling)
        duration: 30, //in min
      },
      {
        workout_plan_id: 3, // Example workout plan ID
        activity_id: 4, // Example activity ID (Yoga)
        duration: 15, //in min
      },
    ],
  });

  // Seed WorkoutLogs
  const workoutLogs = await prisma.workoutLog.createMany({
    data: [
      {
        user_id: 1, // Example user ID
        date: new Date("2025-03-01"),
        activity_id: 1, // Example activity ID (Running)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
      {
        user_id: 2, // Example user ID
        date: new Date("2025-03-01"),
        activity_id: 2, // Example activity ID (Swimming)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
      {
        user_id: 1, // Example user ID
        date: new Date("2025-03-02"),
        activity_id: 3, // Example activity ID (Cycling)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
      {
        user_id: 2, // Example user ID
        date: new Date("2025-03-02"),
        activity_id: 1, // Example activity ID (Running)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
      {
        user_id: 3, // Example user ID
        date: new Date("2025-03-03"),
        activity_id: 4, // Example activity ID (Yoga)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
      {
        user_id: 4, // Example user ID
        date: new Date("2025-03-03"),
        activity_id: 5, // Example activity ID (Weightlifting)
        duration: 60, // 1 hour
        status: "COMPLETED",
      },
    ],
  });

  // Seed FoodCatalogue
  const foodCatalogue = await prisma.foodCatalogue.createMany({
    data: [
      {
        name: "Apple",
        calories: 95,
        carbs: 25,
        protein: 0.5,
        fats: 0.3,
        serving_size_gm: 100,
      },
      {
        name: "Banana",
        calories: 105,
        carbs: 27,
        protein: 1.3,
        fats: 0.4,
        serving_size_gm: 100,
      },
      {
        name: "Orange",
        calories: 62,
        carbs: 15,
        protein: 1.2,
        fats: 0.2,
        serving_size_gm: 100,
      },
      {
        name: "Milk",
        calories: 42,
        carbs: 5,
        protein: 3.4,
        fats: 1.2,
        serving_size_gm: 100,
      },
      {
        name: "Eggs",
        calories: 155,
        carbs: 1.1,
        protein: 12.6,
        fats: 10.6,
        serving_size_gm: 100,
      },
      {
        name: "Bread",
        calories: 265,
        carbs: 49,
        protein: 9,
        fats: 3.3,
        serving_size_gm: 100,
      },
      {
        name: "Butter",
        calories: 717,
        carbs: 0.1,
        protein: 0.9,
        fats: 81.1,
        serving_size_gm: 100,
      },
      {
        name: "Cheese",
        calories: 402,
        carbs: 3.1,
        protein: 25,
        fats: 33,
        serving_size_gm: 100,
      },
      {
        name: "Yogurt",
        calories: 59,
        carbs: 4.7,
        protein: 10,
        fats: 0.4,
        serving_size_gm: 100,
      },
      {
        name: "Chicken Breast",
        calories: 165,
        carbs: 0,
        protein: 31,
        fats: 3.6,
        serving_size_gm: 100,
      },
      {
        name: "Rice",
        calories: 205,
        carbs: 45,
        protein: 4.3,
        fats: 0.4,
        serving_size_gm: 100,
      },
      {
        name: "Broccoli",
        calories: 55,
        carbs: 11,
        protein: 3.7,
        fats: 0.7,
        serving_size_gm: 100,
      },
    ],
  });

  // Seed DietPlans
  const dietPlans = await prisma.dietPlan.createMany({
    data: [
      {
        user_id: 1,
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-01-31"),
      },
      {
        user_id: 2,
        start_date: new Date("2023-02-01"),
        end_date: new Date("2023-02-28"),
      },
      {
        user_id: 3,
        start_date: new Date("2023-03-01"),
        end_date: new Date("2023-03-31"),
      },
      {
        user_id: 4,
        start_date: new Date("2023-04-01"),
        end_date: new Date("2023-04-30"),
      },
      {
        user_id: 7,
        start_date: new Date("2023-05-01"),
        end_date: new Date("2023-05-31"),
      },
    ],
  });

  // Seed DietPlanItems
  const dietPlanItems = await prisma.dietPlanItem.createMany({
    data: [
      { diet_plan_id: 1, meal_type: "BREAKFAST", food_id: 1, quantity: 1 },
      { diet_plan_id: 1, meal_type: "LUNCH", food_id: 2, quantity: 1 },
      { diet_plan_id: 1, meal_type: "DINNER", food_id: 3, quantity: 200 },
      { diet_plan_id: 1, meal_type: "SNACK", food_id: 4, quantity: 150 },
      { diet_plan_id: 2, meal_type: "BREAKFAST", food_id: 5, quantity: 100 },
      { diet_plan_id: 2, meal_type: "LUNCH", food_id: 6, quantity: 1 },
      { diet_plan_id: 2, meal_type: "DINNER", food_id: 7, quantity: 10 },
      { diet_plan_id: 2, meal_type: "SNACK", food_id: 8, quantity: 50 },
      { diet_plan_id: 3, meal_type: "BREAKFAST", food_id: 9, quantity: 200 },
      { diet_plan_id: 3, meal_type: "LUNCH", food_id: 10, quantity: 150 },
      { diet_plan_id: 3, meal_type: "DINNER", food_id: 11, quantity: 100 },
      { diet_plan_id: 3, meal_type: "SNACK", food_id: 12, quantity: 50 },
      { diet_plan_id: 4, meal_type: "BREAKFAST", food_id: 1, quantity: 1 },
      { diet_plan_id: 4, meal_type: "LUNCH", food_id: 2, quantity: 1 },
      { diet_plan_id: 4, meal_type: "DINNER", food_id: 3, quantity: 200 },
      { diet_plan_id: 4, meal_type: "SNACK", food_id: 4, quantity: 150 },
      { diet_plan_id: 5, meal_type: "BREAKFAST", food_id: 5, quantity: 100 },
      { diet_plan_id: 5, meal_type: "LUNCH", food_id: 6, quantity: 1 },
      { diet_plan_id: 5, meal_type: "DINNER", food_id: 7, quantity: 10 },
      { diet_plan_id: 5, meal_type: "SNACK", food_id: 8, quantity: 50 },
    ],
  });

  // Seed FoodLogs
  const foodLogs = await prisma.foodLog.createMany({
    data: [
      {
        user_id: 1,
        date: new Date("2023-01-01"),
        food_id: 1,
        quantity: 100,
        status: "COMPLETED",
        meal_type: "BREAKFAST",
      },
      {
        user_id: 2,
        date: new Date("2023-02-01"),
        food_id: 2,
        quantity: 100,
        status: "COMPLETED",
        meal_type: "LUNCH",
      },
      {
        user_id: 3,
        date: new Date("2023-03-01"),
        food_id: 3,
        quantity: 200,
        status: "COMPLETED",
        meal_type: "DINNER",
      },
      {
        user_id: 4,
        date: new Date("2023-04-01"),
        food_id: 4,
        quantity: 150,
        status: "COMPLETED",
        meal_type: "SNACK",
      },
      {
        user_id: 5,
        date: new Date("2023-05-01"),
        food_id: 5,
        quantity: 100,
        status: "COMPLETED",
        meal_type: "BREAKFAST",
      },
    ],
  });

  // Seed AiRecommendations
  const aiRecommendations = await prisma.aiRecommendation.createMany({
    data: [
      { user_id: 1, type: "DIET", plan_id: 1 },
      { user_id: 2, type: "WORKOUT", plan_id: 2 },
      { user_id: 3, type: "DIET", plan_id: 3 },
      { user_id: 4, type: "WORKOUT", plan_id: 4 },
      { user_id: 5, type: "DIET", plan_id: 5 },
    ],
  });

  // Seed DailyProgress
  const dailyProgress = await prisma.dailyProgress.createMany({
    data: [
      {
        user_id: 1,
        date: new Date("2023-01-01"),
        calories_intake: 2000,
        calories_burned: 300,
        protein_intake: 100,
        carbs_intake: 250,
        fats_intake: 50,
        steps_count: 10000,
        water_intake: 2,
      },
      {
        user_id: 2,
        date: new Date("2023-02-01"),
        calories_intake: 2200,
        calories_burned: 400,
        protein_intake: 120,
        carbs_intake: 270,
        fats_intake: 60,
        steps_count: 12000,
        water_intake: 2.5,
      },
      {
        user_id: 3,
        date: new Date("2023-03-01"),
        calories_intake: 1800,
        calories_burned: 200,
        protein_intake: 80,
        carbs_intake: 200,
        fats_intake: 40,
        steps_count: 8000,
        water_intake: 1.5,
      },
      {
        user_id: 4,
        date: new Date("2023-04-01"),
        calories_intake: 2100,
        calories_burned: 350,
        protein_intake: 110,
        carbs_intake: 260,
        fats_intake: 55,
        steps_count: 11000,
        water_intake: 2.2,
      },
      {
        user_id: 5,
        date: new Date("2023-05-01"),
        calories_intake: 1900,
        calories_burned: 250,
        protein_intake: 90,
        carbs_intake: 220,
        fats_intake: 45,
        steps_count: 9000,
        water_intake: 2,
      },
    ],
  });

  // Seed Messages
  const messages = await prisma.message.createMany({
    data: [
      { sender_id: 1, receiver_id: 2, content: "Hello Bob!" },
      { sender_id: 2, receiver_id: 1, content: "Hi Alice!" },
      { sender_id: 1, receiver_id: 2, content: "How are you?" },
      { sender_id: 2, receiver_id: 1, content: "I'm good, thanks!" },
      { sender_id: 1, receiver_id: 2, content: "What's up?" },
      { sender_id: 2, receiver_id: 3, content: "Hi Charlie!" },
      { sender_id: 3, receiver_id: 2, content: "Hello Bob!" },
      { sender_id: 2, receiver_id: 3, content: "How's it going?" },
      { sender_id: 3, receiver_id: 2, content: "Not bad, you?" },
      { sender_id: 2, receiver_id: 3, content: "Doing well, thanks!" },
      { sender_id: 3, receiver_id: 4, content: "Hey David!" },
      { sender_id: 4, receiver_id: 3, content: "Hi Charlie!" },
      { sender_id: 3, receiver_id: 4, content: "What's new?" },
      { sender_id: 4, receiver_id: 3, content: "Not much, you?" },
      { sender_id: 3, receiver_id: 4, content: "Same here." },
      { sender_id: 4, receiver_id: 5, content: "Hello Eve!" },
      { sender_id: 5, receiver_id: 4, content: "Hi David!" },
      { sender_id: 4, receiver_id: 5, content: "How are you?" },
      { sender_id: 5, receiver_id: 4, content: "I'm good, thanks!" },
      { sender_id: 4, receiver_id: 5, content: "What's up?" },
      { sender_id: 5, receiver_id: 1, content: "Hi Alice!" },
      { sender_id: 1, receiver_id: 5, content: "Hello Eve!" },
      { sender_id: 5, receiver_id: 1, content: "How's it going?" },
      { sender_id: 1, receiver_id: 5, content: "Not bad, you?" },
      { sender_id: 5, receiver_id: 1, content: "Doing well, thanks!" },
    ],
  });

  // Seed Notifications
  const notifications = await prisma.notification.createMany({
    data: [
      { user_id: 1, message: "You have a new message from Bob." },
      { user_id: 2, message: "You have a new message from Charlie." },
      { user_id: 3, message: "You have a new message from David." },
      { user_id: 4, message: "You have a new message from Eve." },
      { user_id: 5, message: "You have a new message from Alice." },
    ],
  });

  // Seed Products
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Protein Powder",
        description: "High-quality protein powder",
        price: 50.0,
        stock: 100,
        user_id: 7,
        category: "Supplements",
        image_url: "protein.jpg",
        status: "ACTIVE",
      },
      {
        name: "Running Shoes",
        description: "Comfortable running shoes",
        price: 100.0,
        stock: 50,
        user_id: 7,
        category: "Footwear",
        image_url: "shoes.jpg",
        status: "ACTIVE",
      },
      {
        name: "Yoga Mat",
        description: "Non-slip yoga mat",
        price: 30.0,
        stock: 200,
        user_id: 1,
        category: "Accessories",
        image_url: "mat.jpg",
        status: "ACTIVE",
      },
      {
        name: "Dumbbells",
        description: "Adjustable dumbbells",
        price: 80.0,
        stock: 30,
        user_id: 1,
        category: "Equipment",
        image_url: "dumbbells.jpg",
        status: "ACTIVE",
      },
      {
        name: "Fitness Tracker",
        description: "Advanced fitness tracker",
        price: 150.0,
        stock: 40,
        user_id: 1,
        category: "Electronics",
        image_url: "tracker.jpg",
        status: "ACTIVE",
      },
      {
        name: "Resistance Bands",
        description: "High-quality resistance bands",
        price: 20.0,
        stock: 150,
        user_id: 2,
        category: "Equipment",
        image_url: "bands.jpg",
        status: "ACTIVE",
      },
      {
        name: "Water Bottle",
        description: "Insulated water bottle",
        price: 15.0,
        stock: 300,
        user_id: 3,
        category: "Accessories",
        image_url: "bottle.jpg",
        status: "ACTIVE",
      },
      {
        name: "Jump Rope",
        description: "Adjustable jump rope",
        price: 10.0,
        stock: 200,
        user_id: 4,
        category: "Equipment",
        image_url: "rope.jpg",
        status: "ACTIVE",
      },
      {
        name: "Gym Bag",
        description: "Durable gym bag",
        price: 40.0,
        stock: 100,
        user_id: 5,
        category: "Accessories",
        image_url: "bag.jpg",
        status: "ACTIVE",
      },
      {
        name: "Foam Roller",
        description: "High-density foam roller",
        price: 25.0,
        stock: 120,
        user_id: 6,
        category: "Equipment",
        image_url: "roller.jpg",
        status: "ACTIVE",
      },
    ],
  });

  // Seed Orders
  const orders = await prisma.order.createMany({
    data: [
      { user_id: 1, total_price: 50.0 },
      { user_id: 2, total_price: 100.0 },
      { user_id: 3, total_price: 30.0 },
      { user_id: 4, total_price: 80.0 },
      { user_id: 5, total_price: 150.0 },
      { user_id: 1, total_price: 20.0 },
      { user_id: 2, total_price: 15.0 },
      { user_id: 3, total_price: 40.0 },
      { user_id: 4, total_price: 25.0 },
      { user_id: 5, total_price: 120.0 },
    ],
  });

  // Seed OrderItems
  const orderItems = await prisma.orderItem.createMany({
    data: [
      { order_id: 1, product_id: 1, quantity: 1, price: 50.0 },
      { order_id: 2, product_id: 2, quantity: 1, price: 100.0 },
      { order_id: 3, product_id: 3, quantity: 1, price: 30.0 },
      { order_id: 4, product_id: 4, quantity: 1, price: 80.0 },
      { order_id: 5, product_id: 5, quantity: 1, price: 150.0 },
      { order_id: 6, product_id: 6, quantity: 1, price: 20.0 },
      { order_id: 7, product_id: 7, quantity: 1, price: 15.0 },
      { order_id: 8, product_id: 8, quantity: 1, price: 40.0 },
      { order_id: 9, product_id: 9, quantity: 1, price: 25.0 },
      { order_id: 10, product_id: 10, quantity: 1, price: 120.0 },
    ],
  });

  // Seed Cart
  const cart = await prisma.cart.createMany({
    data: [
      { user_id: 1, product_id: 1, quantity: 1 },
      { user_id: 2, product_id: 2, quantity: 1 },
      { user_id: 3, product_id: 3, quantity: 1 },
      { user_id: 4, product_id: 4, quantity: 1 },
      { user_id: 5, product_id: 5, quantity: 1 },
      { user_id: 1, product_id: 6, quantity: 1 },
      { user_id: 2, product_id: 7, quantity: 1 },
      { user_id: 3, product_id: 8, quantity: 1 },
      { user_id: 4, product_id: 9, quantity: 1 },
      { user_id: 5, product_id: 10, quantity: 1 },
    ],
  });

  // Seed Wishlist
  const wishlist = await prisma.wishlist.createMany({
    data: [
      { user_id: 1, product_id: 1 },
      { user_id: 2, product_id: 2 },
      { user_id: 3, product_id: 3 },
      { user_id: 4, product_id: 4 },
      { user_id: 5, product_id: 5 },
      { user_id: 1, product_id: 6 },
      { user_id: 2, product_id: 7 },
      { user_id: 3, product_id: 8 },
      { user_id: 4, product_id: 9 },
      { user_id: 5, product_id: 10 },
    ],
  });

  // Seed ApiKeys
  const apiKeys = await prisma.apiKey.createMany({
    data: [
      { user_id: 1, api_key: "apikey1" },
      { user_id: 2, api_key: "apikey2" },
      { user_id: 3, api_key: "apikey3" },
      { user_id: 4, api_key: "apikey4" },
      { user_id: 5, api_key: "apikey5" },
    ],
  });

  // Seed ContactUs
  const contactUs = await prisma.contactUs.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@example.com",
        subject: "Inquiry",
        message: "I have a question.",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Feedback",
        message: "Great service!",
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        subject: "Support",
        message: "Need help with my order.",
      },
      {
        name: "Emily Davis",
        email: "emily@example.com",
        subject: "Complaint",
        message: "Issue with delivery.",
      },
      {
        name: "Robert Brown",
        email: "robert@example.com",
        subject: "Suggestion",
        message: "Add more products.",
      },
    ],
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
