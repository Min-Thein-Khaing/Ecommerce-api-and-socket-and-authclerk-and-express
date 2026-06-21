import "dotenv/config";
import { User } from "./models/user.model.js";
import { clerkClient } from "@clerk/express";

const makeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;

    if (!email) return;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      {
        new: true,
      }
    );
    if (user) {
      await clerkClient.users.updateUserMetadata(user.clerkId as string, {
        publicMetadata: { role: "admin" },
      });
    }
  } catch (error: any) {
    console.log(error);
  }
};
export default makeAdmin;
