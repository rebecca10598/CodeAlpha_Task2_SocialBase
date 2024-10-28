import Notification from "../models/notification_model.js";
import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import { v2 as cloudinary } from "cloudinary"; // imports Cloudinary for image upload

// create a post controller 
export const createPost = async (req, res) => 
{
	try 
    {	// destructuring to get text & img from the request body
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId); 
		if (!user) return res.status(404).json({ message: "The User was not found" });

		if (!text && !img) 
        {
			return res.status(400).json({ error: "The post must have either text or an image" });
		}

		if (img) // if there's an image, upload it to Cloudinary
        {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url; // store secure URL of the uploaded image
		}

		const newPost = new Post // create new post & save in db
        ({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost); // send created post back to client
	} 
    catch (error) 
    {
		res.status(500).json({ error: "There is an internal server error" });
		console.log("There is an error in createPost controller: ", error);
	}
};

// delete a post controller
export const deletePost = async (req, res) => 
{
	try 
    {
		const post = await Post.findById(req.params.id); // find post by its ID
		if (!post) 
        {
			return res.status(404).json({ error: "The post was not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) // ensure requesting user is the post owner
        {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) // if post has an image, delete it from Cloudinary
        {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id); // delete post from db

		res.status(200).json({ message: "The post has been successfully deleted" });
	} 
    catch (error) 
    {
		console.log("There is an error in deletePost controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// delete a comment from a post controller 
export const deleteComment = async (req, res) => 
{
        try 
        {
            const postId = req.params.id; // get post ID from URL
            const commentId = req.params.commentId;  // get comment ID from URL
            const userId = req.user._id; 
    
            const post = await Post.findById(postId); // find post by ID
            if (!post) 
            {
                return res.status(404).json({ error: "The post was not found" });
            }
    
            const comment = post.comments.id(commentId); // find comment by ID
            if (!comment) 
            {
                return res.status(404).json({ error: "The comment was not found" });
            }
    
			// check if requesting user is the comment author or post owner
            if (comment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) 
            {
                return res.status(401).json({ error: "You are not authorized to delete this comment" });
            }
    
            post.comments = post.comments.filter((c) => c._id.toString() !== commentId); // filter out comment to be deleted
            await post.save(); 
    
            res.status(200).json({ message: "The comment has been successfully deleted", post });
        }
        catch (error) 
        {
            console.log("There is an error in deleteComment: ", error.message);
            res.status(500).json({ error: "There is an internal server error" });
        }
};    

// like or unlike a post controller
export const likeUnlikePost = async (req, res) => 
{
    try 
    {
		const userId = req.user._id; // get current user ID
		const { id: postId } = req.params; // get post ID from URL

        const post = await Post.findById(postId);

        if (!post) 
        {
            return res.status(404).json({ error: "The post was not found" });
        }

        const userLikedPost = post.likes.includes(userId); // check if user already liked the post

        if (userLikedPost) 
        {
            // UNLIKE the post (if user already liked it)
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            return res.status(200).json(updatedLikes );
        } 
        else // LIKE the post
        {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification // notify post owner
            ({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }
    } 
    catch (error) 
    {
        console.log("There is an error in likeUnlikePost controller: ", error);
        res.status(500).json({ error: "There is an internal server error" });
    }
};    

// get all posts controller (sorted by creation date)
export const getAllPosts = async (req, res) => 
{
	try 
    {	// find all posts - sort by newest first (populate user and comment data)
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0)  // if no posts exist, return empty array
        {
			return res.status(200).json([]);
		}

		res.status(200).json(posts); // return posts
	} 
    catch (error) 
    {
		console.log("There is an error in getAllPosts controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// get posts liked by a specific user controller 
export const getLikedPosts = async (req, res) => 
{
	const userId = req.params.id;

	try 
    {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "The User was not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // find posts liked by user
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts); // return liked posts
	} 
    catch (error) 
    {
		console.log("There is an error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// controller to get posts from users the current user is following
export const getFollowingPosts = async (req, res) => 
{
	try 
	{
		const userId = req.user._id;
		const user = await User.findById(userId); // find current user in db by their ID
		if (!user) return res.status(404).json({ error: "The User was not found" });

		const following = user.following; // get list of users that the current user is following

		// find all posts from users in following list, sorted by creation date (newest first)
		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 }) // sort posts by creation date (descending)
			.populate({ // populate user field in the post (replace user ID with user object details), excluding password 
				path: "user",
				select: "-password",
			})
			.populate({ // populate comments.user field (user details of those who commented), excluding the password field
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} 
	catch (error) 
	{
		console.log("There is an error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// controller for get posts made by a specific user, identified by their username
export const getUserPosts = async (req, res) => 
{
	try 
    {
		const { username } = req.params; // destructure username from request parameters (URL)

		const user = await User.findOne({ username }); // find user in db by their username
		if (!user) return res.status(404).json({ error: "The User was not found" });

		// find all posts made by user, using their user ID, sorted by creation date (newest first)
		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} 
    catch (error) 
    {
		console.log("There is an error in getUserPosts controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

export const commentOnPost = async (req, res) => 
{
	try 
	{
		const { text } = req.body; 
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) 
		{
			return res.status(400).json({ error: "The text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) 
		{
			return res.status(404).json({ error: "The post was not found" });
		}

		const comment = { user: userId, text };
		post.comments.push(comment);
		await post.save();

		// create notification for the post owner
		const notification = new Notification
		({
			from: userId,
			to: post.user,
			type: "comment",
			postId: postId // optional
		});
		await notification.save();

		res.status(200).json(post);
	} 
	catch (error) 
	{
		console.log("There is an error in commentOnPost controller: ", error);
		res.status(500).json({ error: "There is an internal server error" });
	}
};