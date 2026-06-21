import express from "express";
import { getProducts } from "../controller/product.controller.js";
import protect from "../middleware/protect.middle.js";

const router = express.Router();

router.get("/", protect, getProducts);

export default router;
