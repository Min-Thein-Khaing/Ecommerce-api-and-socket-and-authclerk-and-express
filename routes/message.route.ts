import express from "express";
import protect from "../middleware/protect.middle.js";
import { getConversationsForSidebar, getUsersForSidebar ,getMessages ,sendMessage } from "../controller/message.controller.js";
const router = express.Router();

router.get("/users", protect, getUsersForSidebar);
router.get('/conversation',protect, getConversationsForSidebar)
router.get('/send/:receiverId',protect, getMessages)
router.post('/send/:receiverId',protect, sendMessage)


export default router;
