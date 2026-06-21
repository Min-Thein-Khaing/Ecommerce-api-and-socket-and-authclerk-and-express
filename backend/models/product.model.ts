import mongoose from "mongoose";

type Category = "Men" | "Women" | "Kids" | "Shoes" | "Bags" | "Other";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"],
      default: "Other",
    },
    stock: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

//seaching
productSchema.index({ name: "text", description: "text" });
export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
