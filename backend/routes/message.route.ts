import express from "express";
import protect from "../middleware/protect.middle.js";
import { getCurrentUser, getConversationsForSidebar, getUsersForSidebar ,getMessages ,sendMessage } from "../controller/message.controller.js";
const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.get("/users", protect, getUsersForSidebar);
router.get('/conversation',protect, getConversationsForSidebar)
router.get('/:receiverId',protect, getMessages)
router.post('/send/:receiverId',protect, sendMessage)


export default router;
