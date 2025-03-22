import express from "express";
import bodyParser from "body-parser";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/adminRouter.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import commonRouter from "./routes/commonRouter.js";

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/common", commonRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
