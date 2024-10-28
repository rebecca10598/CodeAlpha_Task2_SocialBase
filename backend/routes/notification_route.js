import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import 
{ 
    deleteNotifications, 
    getNotifications, 
    getUnreadNotificationsCount 
} 
from "../controllers/notification_controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
router.get('/unread-count', protectRoute, getUnreadNotificationsCount); 

export default router;
