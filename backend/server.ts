import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import UserRoute from "./routes/user.route.js";
import ProductRoute from "./routes/product.route.js";
import MessageRoute from "./routes/message.route.js";
import { server } from "./config/socket.js";
import makeAdmin from "./script.js";
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));

// Clerk webhook signatures must be checked against the untouched request body.
app.use("/api/clerk", express.raw({ type: "application/json" }), UserRoute);
app.use(express.json({ limit: "2mb" }));
app.use(clerkMiddleware());

const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use("/api/posts",ProductRoute)
app.use("/api/message",MessageRoute)



server.on("request", app);
server.listen(port, async () => {
  try {
    await connectDB();
    await makeAdmin();
    console.log(`Server is running at http://localhost:${port}`);
  } catch (error) {
    process.exit(1);
  }
});
