import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";



interface CustomRequest extends Request {
    user?: any;
}
 const protect = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = user;
  next();
};

export default protect;
