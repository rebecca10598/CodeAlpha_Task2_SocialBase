import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import 
{ 
    getUserProfile, 
    followUnfollowUsers, 
    getSuggestedUsers, 
    updateUser 
} 
from "../controllers/user_controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile); // route to get profile of a user using username
router.post("/follow/:id", protectRoute, followUnfollowUsers); // route to follow/unfollow a user by ID
router.get("/suggested", protectRoute, getSuggestedUsers); // route to get suggested users 
router.post("/update", protectRoute, updateUser); // route to update user's profile info

export default router;