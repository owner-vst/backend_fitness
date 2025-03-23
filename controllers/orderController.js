import { z } from "zod";

import prisma from "../db/prismaClient.js"; // Adjust the import based on your project structure
import pkg from "@prisma/client"; // Default import
const { Decimal } = pkg; // Import Decimal to handle prices properly

// Zod schema for creating an order
const createOrderSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
  total_price: z.number().positive("Total price must be positive"),
  items: z.array(
    z.object({
      product_id: z.number().min(1, "Product ID is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ),
});

export const createOrder = async (req, res) => {
  const { body } = req;

  try {
    // Validate the request body
    const parsedBody = createOrderSchema.parse(body);

    // Prepare the order items with prices
    const orderItems = await Promise.all(
      parsedBody.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.product_id },
          select: { price: true }, // Get only the price of the product
        });

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: new Decimal(product.price), // Store the price at the time of the order
        };
      })
    );

    // Calculate the total price
    const totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price.toNumber() * item.quantity,
      0
    );

    // Create the order with items
    const order = await prisma.order.create({
      data: {
        user_id: parsedBody.user_id,
        total_price: new Decimal(totalPrice),
        status: "PENDING", // Default status is PENDING
        created_at: new Date(),
        updated_at: new Date(),
        items: {
          create: orderItems, // Create the order items with the price at the time of the order
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateOrderSchema = z.object({
  total_price: z.number().positive("Total price must be positive").optional(),
  status: z.enum(["PENDING", "DELIVERED", "CANCELLED"]).optional(),
});

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    // Validate the request body if needed
    const { items, status } = body;

    // Find the order by ID
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update the order status if provided
    let updatedStatus = order.status; // Keep the original status if not provided
    if (status) {
      updatedStatus = status;
    }

    // Update the order items (quantity change only, price should remain the same)
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const orderItem = order.items.find(
          (oi) => oi.product_id === item.product_id
        );
        if (!orderItem) {
          throw new Error(
            `Item with product ID ${item.product_id} not found in the order`
          );
        }

        // Update only quantity, price remains the same
        return await prisma.orderItem.update({
          where: { id: orderItem.id },
          data: {
            quantity: item.quantity,
            // updated_at: new Date(), // Uncomment if you want to track updates
          },
        });
      })
    );

    // Recalculate total price
    const totalPrice = updatedItems.reduce(
      (acc, item) => acc + item.price.toNumber() * item.quantity,
      0
    );

    // Update the order total price and status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        total_price: new Decimal(totalPrice),
        status: updatedStatus, // Update the status if provided
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the order by ID
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Soft delete: update status to CANCELED or DELETED
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: "CANCELED", // Mark as canceled or deleted
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

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
      include: {
        items: {
          include: {
            product: true, // Include product details for each order item
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

    return res.status(200).json({
      success: true,
      orders,
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
      include: {
        items: {
          include: {
            product: true, // Include product details for each order item
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
