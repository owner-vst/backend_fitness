import express from "express";
import bodyParser from "body-parser";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/adminRouter.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import cors from "cors";
import dotenv from "dotenv";
import commonRouter from "./routes/commonRouter.js";
import userRouter from "./routes/userRouter.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow credentials (cookies, etc.)
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/common", commonRouter);
app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
