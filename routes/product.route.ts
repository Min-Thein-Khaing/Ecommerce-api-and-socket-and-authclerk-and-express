import express from "express";
import { getProducts } from "../controller/product.controller.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), getProducts);

export default router;
