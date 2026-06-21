import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import { User } from "../models/user.model.js";

export const clerkWebHook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const email = evt.data.email_addresses[0]?.email_address;
      if (!email) {
        return res.status(422).json({ error: "Clerk user does not have an email address" });
      }
      const userData = {
        name:
          [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") ||
          email.split("@")[0],
        email,
        clerkId: evt.data.id,
        image: evt.data.image_url || "",
      };
      await User.findOneAndUpdate(
        { email },
        { $set: userData },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }
    return res.json({ success: true, message: "Webhook verified" });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
};
