import express from "express";
import { clerkWebHook } from "../controller/webhook.controller.js";

const router = express.Router();

router.post("/", clerkWebHook);

export default router;
