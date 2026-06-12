import express from "express";
import { clerkWebHook } from "../controller/webhook.controller.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), clerkWebHook);

export default router;
