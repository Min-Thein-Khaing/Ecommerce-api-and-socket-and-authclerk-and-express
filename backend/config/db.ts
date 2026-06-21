import mongoose from "mongoose";
import "dotenv/config";
export const connectDB = async () => {
  try {
    const dbWithMongoose = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${dbWithMongoose.connection.host}`);
  } catch (err) {
    console.log(err);
     process.exit(1);
  }
};