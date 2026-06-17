import "dotenv/config";
import { User } from "./models/user.model.js";
import { clerkClient } from "@clerk/express";

const makeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;

    const user = await User.findOneAndReplace(
      { email },
      {
        role: "admin",
      },
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