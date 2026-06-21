import { clerkClient, getAuth } from "@clerk/express";
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
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let user = await User.findOne({ clerkId: userId });

    // Webhooks cannot reach localhost during local development. Synchronize the
    // authenticated Clerk user here as a fallback so the app remains usable.
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return res.status(422).json({ error: "Clerk user does not have an email address" });
      }

      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        email.split("@")[0];

      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            clerkId: clerkUser.id,
            name,
            email,
            image: clerkUser.imageUrl || "",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
