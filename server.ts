import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import UserRoute from "./routes/user.route.js";
import ProductRoute from "./routes/product.route.js";
import MessageRoute from "./routes/product.route.js";
import makeAdmin from "./script.js";
const app = express();
app.use(clerkMiddleware());

// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use("/api/clerk", UserRoute);
app.use("/api/posts",ProductRoute)
app.use("/api/message",MessageRoute)



app.listen(port, async () => {
  try {
    await connectDB();
    await makeAdmin();
    console.log(`Server is running at http://localhost:${port}`);
  } catch (error) {
    process.exit(1);
  }
});
