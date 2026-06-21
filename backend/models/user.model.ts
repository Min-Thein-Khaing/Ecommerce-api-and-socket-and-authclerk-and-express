import mongoose from "mongoose";
import { IUser } from "../types.js";

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  clerkId:{
    type: String,
    unique: true,
    sparse: true
  },
  image: { type: String, default: "" },
//   password: {
//     type: String,
//     required: true,
//   },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
},{
    timestamps: true
});
export const User = mongoose.model<IUser>("User", userSchema);
