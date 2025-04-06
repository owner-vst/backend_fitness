import prisma from "../db/prismaClient.js";
import { z } from "zod";

const messageSchema = z.object({
  receiver_id: z.string().min(1),
  content: z.string().min(1).max(1000),
});

export const sendMessage = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let body;
    try {
      body = req.body; // Directly access the request body
    } catch (error) {
      return res.status(400).json({
        message: "Invalid request body - must be valid JSON",
      });
    }

    if (!body) {
      return res.status(400).json({ message: "Request body is required" });
    }

    const validatedData = messageSchema.parse(body);

    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        sender_id: currentUser.userId,
        receiver_id: parseInt(validatedData.receiver_id), // Parse receiver_id as an integer
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            first_name: true,
            profilePic: true,
          },
        },
        receiver: {
          select: {
            first_name: true,
            profilePic: true,
          },
        },
      },
    });

    // Create a notification for the receiver if message creation was successful
    if (message) {
      await prisma.notification.create({
        data: {
          user_id: parseInt(validatedData.receiver_id), // Parse receiver_id as an integer for the notification
          message: `${currentUser.username} sent you a message`,
        },
      });
    }

    return res.status(200).json({
      id: message.id.toString(),
      content: message.content,
      sender_id: message.sender_id.toString(),
      receiver_id: message.receiver_id.toString(),
      created_at: message.created_at.toISOString(),
      sender: message.sender,
      receiver: message.receiver,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Get Last Messages
export const getLastMessages = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUser.userId },
          { receiver_id: currentUser.userId },
        ],
      },
      include: {
        sender: {
          select: {
            first_name: true,
            profilePic: true,
          },
        },
        receiver: {
          select: {
            first_name: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    let uniqueUsers = [
      ...new Set(
        conversations
          .map((conv) => conv.sender_id)
          .concat(conversations.map((conv) => conv.receiver_id))
      ),
    ];

    uniqueUsers = uniqueUsers.filter((id) => id !== currentUser.userId);

    const messages = [];
    for (const userId of uniqueUsers) {
      const lastMessage = conversations.find(
        (conv) =>
          (conv.sender_id == userId &&
            conv.receiver_id == currentUser.userId) ||
          (conv.receiver_id == userId && conv.sender_id == currentUser.userId)
      );

      const unreadMessages = conversations.filter(
        (conv) =>
          conv.receiver_id == currentUser.userId &&
          conv.status === "SENT" &&
          conv.sender_id == userId
      );

      const lastMessageReceiver = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          first_name: true,
          profilePic: true,
        },
      });

      messages.push({
        ...lastMessage,
        sender_id: currentUser.userId.toString(),
        receiver_id: userId.toString(),
        id: lastMessage.id.toString(),
        unreadMessages: unreadMessages.length,
        receiver: lastMessageReceiver,
        sender: {
          first_name: currentUser.first_name,
          profilePic: currentUser.profilePic,
        },
      });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};
// Get Conversation API
export const getConversation = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming req.user is set by your authentication middleware
    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { user_id: otherUserId } = req.query; // Access the query parameter `user_id`
    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    // Fetch the messages between the current user and the other user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            sender_id: currentUser.userId,
            receiver_id: parseInt(otherUserId),
          },
          {
            sender_id: parseInt(otherUserId),
            receiver_id: currentUser.userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            first_name: true,
            profilePic: true,
          },
        },
      },
      orderBy: {
        created_at: "asc", // Sort messages by creation date (ascending)
      },
    });

    // Mark all messages as read
    await prisma.message.updateMany({
      where: {
        receiver_id: currentUser.userId,
        sender_id: parseInt(otherUserId),
      },
      data: { status: "READ" }, // Assuming "READ" is a valid status in your schema
    });

    const formattedMessages = messages.map((message) => ({
      id: message.id.toString(),
      content: message.content,
      sender_id: message.sender_id.toString(),
      receiver_id: message.receiver_id.toString(),
      created_at: message.created_at.toISOString(),
      sender: message.sender, // Include sender details (first name and profile picture)
    }));

    return res.status(200).json(formattedMessages); // Return the formatted messages as the response
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};
export const getUsersList = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.userId,
        },
      },
      select: {
        id: true,
        profilePic: true,
        first_name: true,
        email: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};
export const unreadMessagesCount = async (req, res) => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const unreadCount = await prisma.message.count({
      where: {
        receiver_id: currentUserId,
        status: "SENT", // Assuming 'SENT' means unread and 'READ' means the message has been read
      },
    });
    return res.status(200).json({ unreadMessagesCount: unreadCount });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};
