import prisma from "../db/prismaClient.js";
import pkg from "@prisma/client"; // Default import
const { Decimal } = pkg; // Destructure to get the Decimal class

import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().optional(),
});

export const createProduct = async (req, res) => {
  const { body } = req;
  const user_id = req.userId;
  try {
    // Validate the request body
    const parsedBody = createProductSchema.parse(body);

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: parsedBody.name,
        description: parsedBody.description || null,
        price: new Decimal(parsedBody.price),
        stock: parsedBody.stock,
        category: parsedBody.category,
        image_url: parsedBody.image_url || null,
        user_id, // Associate the product with the user who created it
        status: "ACTIVE", // Default status is ACTIVE
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  stock: z.number().min(0, "Stock cannot be negative").optional(),
  category: z.string().optional(),
  image_url: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(), // Allow status to be updated
});

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { user_id } = req.user;
  try {
    // Validate the request body
    const parsedBody = updateProductSchema.parse(body);

    // Find the product by ID
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: parsedBody.name || product.name,
        description: parsedBody.description || product.description,
        price: parsedBody.price ? new Decimal(parsedBody.price) : product.price,
        stock: parsedBody.stock ?? product.stock,
        category: parsedBody.category || product.category,
        image_url: parsedBody.image_url || product.image_url,
        status: parsedBody.status || product.status, // Update the status if provided
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product by ID
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete: update status to INACTIVE
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        status: "INACTIVE", // Change status to 'INACTIVE'
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product marked as inactive successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const viewProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      //   include: {
      //     order_items: true, // Optionally include related order items
      //     cart: true, // Optionally include related cart items
      //     wishlist: true, // Optionally include related wishlist items
      //   },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const viewProductsByUserSchema = z.object({
  user_id: z.number().min(1, "User ID is required"),
});

export const viewProductsByUser = async (req, res) => {
  const user_id = req.userId; // Getting user_id from params

  try {
    // Validate the user_id parameter
    const parsedBody = viewProductsByUserSchema.parse({
      user_id: parseInt(user_id),
    });

    // Fetch products created by the user
    const products = await prisma.product.findMany({
      where: {
        user_id: parsedBody.user_id, // Filtering products by user_id
        status: "ACTIVE", // Optionally filter to include only active products
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    // Fetch all products that belong to the user (if you want only products owned by the user)
    const products = await prisma.product.findMany({
      where: {
        // Only fetch products for this user
        // status: "ACTIVE", // Optionally filter to get only active products
      },
    });

    // If you want to include related data (e.g., orders, cart, wishlist), you can add the `include` property
    // Example:
    // const products = await prisma.product.findMany({
    //   where: {
    //     user_id: user_id,
    //     status: "ACTIVE",
    //   },
    //   include: {
    //     order_items: true, // Optionally include related order items
    //     cart: true, // Optionally include related cart items
    //     wishlist: true, // Optionally include related wishlist items
    //   },
    // });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
