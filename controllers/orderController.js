import { z } from "zod";

import prisma from "../db/prismaClient.js"; // Adjust the import based on your project structure
import pkg from "@prisma/client"; // Default import
const { Decimal } = pkg; // Import Decimal to handle prices properly

// Zod schema for creating an order
// const createOrderSchema = z.object({
//   user_id: z.number().min(1, "User ID is required"),
//   total_price: z.number().positive("Total price must be positive"),
//   items: z.array(
//     z.object({
//       product_id: z.number().min(1, "Product ID is required"),
//       quantity: z.number().min(1, "Quantity must be at least 1"),
//     })
//   ),
// });

// export const createOrder = async (req, res) => {
//   const { body } = req;

//   try {
//     // Validate the request body
//     const parsedBody = createOrderSchema.parse(body);

//     // Prepare the order items with prices
//     const orderItems = await Promise.all(
//       parsedBody.items.map(async (item) => {
//         const product = await prisma.product.findUnique({
//           where: { id: item.product_id },
//           select: { price: true }, // Get only the price of the product
//         });

//         if (!product) {
//           throw new Error(`Product with ID ${item.product_id} not found`);
//         }

//         return {
//           product_id: item.product_id,
//           quantity: item.quantity,
//           price: new Decimal(product.price), // Store the price at the time of the order
//         };
//       })
//     );

//     // Calculate the total price
//     const totalPrice = orderItems.reduce(
//       (acc, item) => acc + item.price.toNumber() * item.quantity,
//       0
//     );

//     // Create the order with items
//     const order = await prisma.order.create({
//       data: {
//         user_id: parsedBody.user_id,
//         total_price: new Decimal(totalPrice),
//         status: "PENDING", // Default status is PENDING
//         created_at: new Date(),
//         updated_at: new Date(),
//         items: {
//           create: orderItems, // Create the order items with the price at the time of the order
//         },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// const updateOrderSchema = z.object({
//   total_price: z.number().positive("Total price must be positive").optional(),
//   status: z.enum(["PENDING", "DELIVERED", "CANCELLED"]).optional(),
// });

// export const updateOrder = async (req, res) => {
//   const { id } = req.params;
//   const { body } = req;

//   try {
//     // Validate the request body if needed
//     const { items, status } = body;

//     // Find the order by ID
//     const order = await prisma.order.findUnique({
//       where: { id: parseInt(id) },
//       include: { items: true },
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Update the order status if provided
//     let updatedStatus = order.status; // Keep the original status if not provided
//     if (status) {
//       updatedStatus = status;
//     }

//     // Update the order items (quantity change only, price should remain the same)
//     const updatedItems = await Promise.all(
//       items.map(async (item) => {
//         const orderItem = order.items.find(
//           (oi) => oi.product_id === item.product_id
//         );
//         if (!orderItem) {
//           throw new Error(
//             `Item with product ID ${item.product_id} not found in the order`
//           );
//         }

//         // Update only quantity, price remains the same
//         return await prisma.orderItem.update({
//           where: { id: orderItem.id },
//           data: {
//             quantity: item.quantity,
//             // updated_at: new Date(), // Uncomment if you want to track updates
//           },
//         });
//       })
//     );

//     // Recalculate total price
//     const totalPrice = updatedItems.reduce(
//       (acc, item) => acc + item.price.toNumber() * item.quantity,
//       0
//     );

//     // Update the order total price and status
//     const updatedOrder = await prisma.order.update({
//       where: { id: parseInt(id) },
//       data: {
//         total_price: new Decimal(totalPrice),
//         status: updatedStatus, // Update the status if provided
//         updated_at: new Date(),
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Order updated successfully",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const deleteOrder = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Find the order by ID
//     const order = await prisma.order.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Soft delete: update status to CANCELED or DELETED
//     const updatedOrder = await prisma.order.update({
//       where: { id: parseInt(id) },
//       data: {
//         status: "CANCELED", // Mark as canceled or deleted
//         updated_at: new Date(),
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Order canceled successfully",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const viewOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true, // Include product details if necessary
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewUserOrders = async (req, res) => {
  const user_id = req.userId;

  try {
    const orders = await prisma.order.findMany({
      where: { user_id: parseInt(user_id) },
      select: {
        id: true,
        status: true,
        total_price: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user",
      });
    }
    const formattedData = orders.map((order) => {
      return {
        id: order.id,
        status: order.status,
        total_price: order.total_price,
        created_at: order.created_at,
        user_id: order.user.id,
        name: order.user.name,
      };
    });
    return res.status(200).json({
      success: true,
      formattedData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        total_price: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const formattedData = orders.map((order) => {
      return {
        id: order.id,
        status: order.status,
        total_price: order.total_price,
        created_at: order.created_at,
        user_id: order.user.id,
        name: order.user.name,
      };
    });
    return res.status(200).json({
      success: true,
      formattedData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
//new Approach

async function recalculateOrderTotal(orderId) {
  const items = await prisma.orderItem.findMany({
    where: { order_id: orderId },
  });

  const total = items.reduce((sum, item) => {
    return sum + item.price.toNumber() * item.quantity;
  }, 0);

  await prisma.order.update({
    where: { id: orderId },
    data: { total_price: total },
  });
}

export const createOrderItemSchema = z.object({
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  user_id: z.number(),
});

export const updateOrderItemSchema = createOrderItemSchema.partial();
export const updateOrderSchemas = z.object({
  status: z.enum(["PENDING", "DELIVERED", "CANCELLED"]),
});

// Create
export const createOrderItem = async (req, res) => {
  const { body } = req;

  try {
    const parsedBody = createOrderItemSchema.parse(body);

    // Check if the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: { id: parsedBody.order_id, user_id: parsedBody.user_id },
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Order does not belong to user or does not exist",
      });
    }

    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: parsedBody.order_id,
        product_id: parsedBody.product_id,
        quantity: parsedBody.quantity,
        price: new Decimal(parsedBody.price),
      },
    });

    await recalculateOrderTotal(parsedBody.order_id);

    return res.status(201).json({
      success: true,
      message: "Order Item created successfully",
      orderItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Read

// Update
export const updateOrderItem = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedBody = updateOrderItemSchema.parse(req.body.data);
    console.log("parsedBody", parsedBody);
    console.log("body", req.body);
    const existing = await prisma.orderItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Order Item not found",
      });
    }

    const updated = await prisma.orderItem.update({
      where: { id: Number(id) },
      data: parsedBody,
    });

    await recalculateOrderTotal(existing.order_id);

    return res.status(200).json({
      success: true,
      message: "Order Item updated successfully",
      orderItem: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete
export const deleteOrderItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.orderItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Order Item not found",
      });
    }

    await prisma.orderItem.delete({ where: { id: Number(id) } });
    await recalculateOrderTotal(existing.order_id);

    return res.status(200).json({
      success: true,
      message: "Order Item deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//get all order items
export const getAllOrderItems = async (req, res) => {
  const { id } = req.params;
  const order_id = id;
  try {
    const whereClause = { order_id: Number(order_id) };

    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      select: {
        id: true,
        product_id: true,
        price: true,
        quantity: true,
        product: {
          select: {
            name: true,
            image_url: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      orderItems,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const readOrderItem = async (req, res) => {
  const { id } = req.params;

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: Number(id) },
    });

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      orderItem,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//order Controller

// Read
export const readOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Update (only status allowed here as per common pattern)
export const updateOrders = async (req, res) => {
  const { id } = req.params;

  try {
    const parsedBody = updateOrderSchemas.parse(req.body);

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: parsedBody,
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete (including cascade order items)
export const deleteOrders = async (req, res) => {
  const { id } = req.params;

  try {
    const orderId = Number(id);

    await prisma.orderItem.deleteMany({ where: { order_id: orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    return res.status(200).json({
      success: true,
      message: "Order and its items deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
