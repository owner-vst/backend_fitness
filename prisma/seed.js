import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

   // Seed Roles
   const roles = await prisma.role.createMany({
    data: [
      { role_name: 'ADMIN' },
      { role_name: 'USER' },
      { role_name: 'VENDOR' },
    ],
  });
  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      { 
        first_name: 'Alice', 
        last_name: 'Smith', 
        name: 'Alice Smith',
        email: 'alice@example.com', 
        dob: new Date('1990-01-01'), 
        gender: 'Female', 
        password_hash: 'hash1', 
        created_at: new Date(), 
        updated_at: new Date(), 
        role_id: 1 
      },
      { 
        first_name: 'Bob', 
        last_name: 'Johnson', 
        name: 'Bob Johnson',
        email: 'bob@example.com', 
        dob: new Date('1985-02-02'), 
        gender: 'Male', 
        password_hash: 'hash2', 
        created_at: new Date(), 
        updated_at: new Date(), 
        role_id: 2 
      },
      { 
        first_name: 'Charlie', 
        last_name: 'Brown', 
        name: 'Charlie Brown',
        email: 'charlie@example.com', 
        dob: new Date('1992-03-03'), 
        gender: 'Other', 
        password_hash: 'hash3', 
        created_at: new Date(), 
        updated_at: new Date(), 
        role_id: 3 
      },
      { 
        first_name: 'David', 
        last_name: 'Wilson', 
        name: 'David Wilson',
        email: 'david@example.com', 
        dob: new Date('1988-04-04'), 
        gender: 'Male', 
        password_hash: 'hash4', 
        created_at: new Date(), 
        updated_at: new Date(), 
        role_id: 2 
      },
      { 
        first_name: 'Eve', 
        last_name: 'Taylor', 
        name: 'Eve Taylor',
        email: 'eve@example.com', 
        dob: new Date('1995-05-05'), 
        gender: 'Female', 
        password_hash: 'hash5', 
        created_at: new Date(), 
        updated_at: new Date(), 
        role_id: 3 
      },
    ]
    
  });

 

  // Seed Permissions
  const permissions = await prisma.permission.createMany({
    data: [
      { role_id: 1, permission: 'CREATE_USER' },
      { role_id: 1, permission: 'DELETE_USER' },
      { role_id: 2, permission: 'VIEW_PRODUCTS' },
      { role_id: 3, permission: 'MANAGE_PRODUCTS' },
      { role_id: 3, permission: 'VIEW_ORDERS' },
    ],
  });

  // Seed UserProfiles
  const userProfiles = await prisma.userProfile.createMany({
    data: [
      { user_id: 1, height: 160, weight: 60, blood_group: 'A_POSITIVE', activity_type: 'MODERATE', goal: 'MAINTAIN' },
      { user_id: 2, height: 170, weight: 70, blood_group: 'B_POSITIVE', activity_type: 'ACTIVE', goal: 'GAIN' },
      { user_id: 3, height: 180, weight: 80, blood_group: 'O_POSITIVE', activity_type: 'LAZY', goal: 'LOSE' },
      { user_id: 4, height: 175, weight: 75, blood_group: 'AB_POSITIVE', activity_type: 'SPORTS_PERSON', goal: 'MAINTAIN' },
      { user_id: 5, height: 165, weight: 65, blood_group: 'A_NEGATIVE', activity_type: 'MODERATE', goal: 'GAIN' },
    ],
  });

  // Seed Activities
  const activities = await prisma.activity.createMany({
    data: [
      { name: 'Running', unit: 'KM' },
      { name: 'Cycling', unit: 'KM' },
      { name: 'Swimming', unit: 'MINUTES' },
      { name: 'Push-ups', unit: 'REPS' },
      { name: 'Squats', unit: 'SETS' },
    ],
  });

  // Seed WorkoutPlans
  const workoutPlans = await prisma.workoutPlan.createMany({
    data: [
      { user_id: 1, start_date: new Date('2023-01-01'), end_date: new Date('2023-01-31') },
      { user_id: 2, start_date: new Date('2023-02-01'), end_date: new Date('2023-02-28') },
      { user_id: 3, start_date: new Date('2023-03-01'), end_date: new Date('2023-03-31') },
      { user_id: 4, start_date: new Date('2023-04-01'), end_date: new Date('2023-04-30') },
      { user_id: 5, start_date: new Date('2023-05-01'), end_date: new Date('2023-05-31') },
    ],
  });

  // Seed WorkoutPlanItems
  const workoutPlanItems = await prisma.workoutPlanItem.createMany({
    data: [
      { workout_plan_id: 1, activity_id: 1, quantity: 5 },
      { workout_plan_id: 1, activity_id: 2, quantity: 10 },
      { workout_plan_id: 2, activity_id: 3, quantity: 30 },
      { workout_plan_id: 2, activity_id: 4, quantity: 20 },
      { workout_plan_id: 3, activity_id: 5, quantity: 3 },
    ],
  });

  // Seed WorkoutLogs
  const workoutLogs = await prisma.workoutLog.createMany({
    data: [
      { user_id: 1, date: new Date('2023-01-01'), activity_id: 1, quantity: 5, calories_burned: 300 },
      { user_id: 2, date: new Date('2023-02-01'), activity_id: 2, quantity: 10, calories_burned: 400 },
      { user_id: 3, date: new Date('2023-03-01'), activity_id: 3, quantity: 30, calories_burned: 200 },
      { user_id: 4, date: new Date('2023-04-01'), activity_id: 4, quantity: 20, calories_burned: 150 },
      { user_id: 5, date: new Date('2023-05-01'), activity_id: 5, quantity: 3, calories_burned: 250 },
    ],
  });

  // Seed FoodCatalogue
  const foodCatalogue = await prisma.foodCatalogue.createMany({
    data: [
      { name: 'Apple', calories: 95, carbs: 25, protein: 0.5, fats: 0.3 },
      { name: 'Banana', calories: 105, carbs: 27, protein: 1.3, fats: 0.4 },
      { name: 'Chicken Breast', calories: 165, carbs: 0, protein: 31, fats: 3.6 },
      { name: 'Rice', calories: 205, carbs: 45, protein: 4.3, fats: 0.4 },
      { name: 'Broccoli', calories: 55, carbs: 11, protein: 3.7, fats: 0.7 },
    ],
  });

  // Seed DietPlans
  const dietPlans = await prisma.dietPlan.createMany({
    data: [
      { user_id: 1, start_date: new Date('2023-01-01'), end_date: new Date('2023-01-31') },
      { user_id: 2, start_date: new Date('2023-02-01'), end_date: new Date('2023-02-28') },
      { user_id: 3, start_date: new Date('2023-03-01'), end_date: new Date('2023-03-31') },
      { user_id: 4, start_date: new Date('2023-04-01'), end_date: new Date('2023-04-30') },
      { user_id: 5, start_date: new Date('2023-05-01'), end_date: new Date('2023-05-31') },
    ],
  });

  // Seed DietPlanItems
  const dietPlanItems = await prisma.dietPlanItem.createMany({
    data: [
      { diet_plan_id: 1, meal_type: 'BREAKFAST', food_id: 1, quantity: 1 },
      { diet_plan_id: 1, meal_type: 'LUNCH', food_id: 2, quantity: 1 },
      { diet_plan_id: 2, meal_type: 'DINNER', food_id: 3, quantity: 200 },
      { diet_plan_id: 2, meal_type: 'SNACK', food_id: 4, quantity: 150 },
      { diet_plan_id: 3, meal_type: 'BREAKFAST', food_id: 5, quantity: 100 },
    ],
  });

  // Seed FoodLogs
  const foodLogs = await prisma.foodLog.createMany({
    data: [
      { user_id: 1, date: new Date('2023-01-01'), food_id: 1, quantity: 1 },
      { user_id: 2, date: new Date('2023-02-01'), food_id: 2, quantity: 1 },
      { user_id: 3, date: new Date('2023-03-01'), food_id: 3, quantity: 200 },
      { user_id: 4, date: new Date('2023-04-01'), food_id: 4, quantity: 150 },
      { user_id: 5, date: new Date('2023-05-01'), food_id: 5, quantity: 100 },
    ],
  });

  // Seed AiRecommendations
  const aiRecommendations = await prisma.aiRecommendation.createMany({
    data: [
      { user_id: 1, type: 'DIET', plan_id: 1 },
      { user_id: 2, type: 'WORKOUT', plan_id: 2 },
      { user_id: 3, type: 'DIET', plan_id: 3 },
      { user_id: 4, type: 'WORKOUT', plan_id: 4 },
      { user_id: 5, type: 'DIET', plan_id: 5 },
    ],
  });

  // Seed DailyProgress
  const dailyProgress = await prisma.dailyProgress.createMany({
    data: [
      { user_id: 1, date: new Date('2023-01-01'), calories_intake: 2000, calories_burned: 300, protein_intake: 100, carbs_intake: 250, fats_intake: 50, steps_count: 10000, water_intake: 2 },
      { user_id: 2, date: new Date('2023-02-01'), calories_intake: 2200, calories_burned: 400, protein_intake: 120, carbs_intake: 270, fats_intake: 60, steps_count: 12000, water_intake: 2.5 },
      { user_id: 3, date: new Date('2023-03-01'), calories_intake: 1800, calories_burned: 200, protein_intake: 80, carbs_intake: 200, fats_intake: 40, steps_count: 8000, water_intake: 1.5 },
      { user_id: 4, date: new Date('2023-04-01'), calories_intake: 2100, calories_burned: 350, protein_intake: 110, carbs_intake: 260, fats_intake: 55, steps_count: 11000, water_intake: 2.2 },
      { user_id: 5, date: new Date('2023-05-01'), calories_intake: 1900, calories_burned: 250, protein_intake: 90, carbs_intake: 220, fats_intake: 45, steps_count: 9000, water_intake: 2 },
    ],
  });

  // Seed Messages
  const messages = await prisma.message.createMany({
    data: [
      { sender_id: 1, receiver_id: 2, content: 'Hello Bob!' },
      { sender_id: 2, receiver_id: 3, content: 'Hi Charlie!' },
      { sender_id: 3, receiver_id: 4, content: 'Hey David!' },
      { sender_id: 4, receiver_id: 5, content: 'Hello Eve!' },
      { sender_id: 5, receiver_id: 1, content: 'Hi Alice!' },
    ],
  });

  // Seed Notifications
  const notifications = await prisma.notification.createMany({
    data: [
      { user_id: 1, message: 'You have a new message from Bob.' },
      { user_id: 2, message: 'You have a new message from Charlie.' },
      { user_id: 3, message: 'You have a new message from David.' },
      { user_id: 4, message: 'You have a new message from Eve.' },
      { user_id: 5, message: 'You have a new message from Alice.' },
    ],
  });

  // Seed Products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Protein Powder', description: 'High-quality protein powder', price: 50.00, stock: 100, category: 'Supplements', image_url: 'protein.jpg' },
      { name: 'Running Shoes', description: 'Comfortable running shoes', price: 100.00, stock: 50, category: 'Footwear', image_url: 'shoes.jpg' },
      { name: 'Yoga Mat', description: 'Non-slip yoga mat', price: 30.00, stock: 200, category: 'Accessories', image_url: 'mat.jpg' },
      { name: 'Dumbbells', description: 'Adjustable dumbbells', price: 80.00, stock: 30, category: 'Equipment', image_url: 'dumbbells.jpg' },
      { name: 'Fitness Tracker', description: 'Advanced fitness tracker', price: 150.00, stock: 40, category: 'Electronics', image_url: 'tracker.jpg' },
    ],
  });

  // Seed Orders
  const orders = await prisma.order.createMany({
    data: [
      { user_id: 1, total_price: 50.00 },
      { user_id: 2, total_price: 100.00 },
      { user_id: 3, total_price: 30.00 },
      { user_id: 4, total_price: 80.00 },
      { user_id: 5, total_price: 150.00 },
    ],
  });

  // Seed OrderItems
  const orderItems = await prisma.orderItem.createMany({
    data: [
      { order_id: 1, product_id: 1, quantity: 1, price: 50.00 },
      { order_id: 2, product_id: 2, quantity: 1, price: 100.00 },
      { order_id: 3, product_id: 3, quantity: 1, price: 30.00 },
      { order_id: 4, product_id: 4, quantity: 1, price: 80.00 },
      { order_id: 5, product_id: 5, quantity: 1, price: 150.00 },
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
    ],
  });

  // Seed ApiKeys
  const apiKeys = await prisma.apiKey.createMany({
    data: [
      { user_id: 1, api_key: 'apikey1' },
      { user_id: 2, api_key: 'apikey2' },
      { user_id: 3, api_key: 'apikey3' },
      { user_id: 4, api_key: 'apikey4' },
      { user_id: 5, api_key: 'apikey5' },
    ],
  });

  // Seed ContactUs
  const contactUs = await prisma.contactUs.createMany({
    data: [
      { name: 'John Doe', email: 'john@example.com', subject: 'Inquiry', message: 'I have a question.' },
      { name: 'Jane Smith', email: 'jane@example.com', subject: 'Feedback', message: 'Great service!' },
      { name: 'Mike Johnson', email: 'mike@example.com', subject: 'Support', message: 'Need help with my order.' },
      { name: 'Emily Davis', email: 'emily@example.com', subject: 'Complaint', message: 'Issue with delivery.' },
      { name: 'Robert Brown', email: 'robert@example.com', subject: 'Suggestion', message: 'Add more products.' },
    ],
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
