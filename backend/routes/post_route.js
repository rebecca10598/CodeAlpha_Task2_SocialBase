import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import 
{
	createPost,
	deletePost,
	commentOnPost,
	deleteComment,
	likeUnlikePost,
	getAllPosts,
	getLikedPosts,
	getFollowingPosts,
	getUserPosts,
} 
from "../controllers/post_controller.js";

const router = express.Router();

// authentication required below
router.post("/create", protectRoute, createPost);                      // route for creating a post
router.delete("/:id", protectRoute, deletePost);                       // route for deleting a post by ID 
router.post("/comment/:id", protectRoute, commentOnPost);              // route for commenting on a post by post ID
router.delete("/comment/:id/:commentId", protectRoute, deleteComment); // route for deleting a comment by post ID & comment ID
router.post("/like/:id", protectRoute, likeUnlikePost);                // route for like/unlike a post by ID
router.get("/all", protectRoute, getAllPosts);                         // route to retrieve all posts
router.get("/likes/:id", protectRoute, getLikedPosts);                 //route to retrieve posts liked by a specific user
router.get("/following", protectRoute, getFollowingPosts);         // route to get posts from users current user is following
router.get("/user/:username", protectRoute, getUserPosts);        // route to retrieve posts from a specific user by username

export default router;