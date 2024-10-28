// packages
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification_model.js";
import User from "../models/user_model.js";

// controller to retrieve a user profile by username
export const getUserProfile = async (req, res) => 
{
	const { username } = req.params;

	try 
    {
		const user = await User.findOne({ username }).select("-password"); // find user excluding password 
		if (!user) return res.status(404).json({ error: "The User was not found" });

		res.status(200).json(user);
	} 
    catch (error) 
    {
		console.log("There is an error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

// controller to follow/unfollow users
export const followUnfollowUsers = async (req, res) => 
{
	try 
    {
		const { id } = req.params;
		const userToModify = await User.findById(id); // find user to follow/unfollow
		const currentUser = await User.findById(req.user._id); // find current authenticated user

		if (id === req.user._id.toString()) 
        {
			return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "The User was not found" });

		const isFollowing = currentUser.following.includes(id); // check if the current user is already following

		if (isFollowing) // UNFOLLOW user (if already following)
        { 
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: `You have UNFOLLOWED User @${userToModify.username}` });
		} 
        else // FOLLOW user (if not following)
        { 
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			// send followed notification to user
			const newNotification = new Notification
            ({
				type: "follow",
				from: req.user._id, // user who is following
				to: userToModify._id, // user being followed
			});
			await newNotification.save();

			res.status(200).json({ message: `You have FOLLOWED User @${userToModify.username}` });
		}
	} 
    catch (error) 
    {
		console.log("There is an error in followUnfollowUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

// controller to get suggested users to follow
export const getSuggestedUsers = async (req, res) => 
{
	try 
    {
		const userId = req.user._id; // get current user's ID

		// get list of users current user is following
		const usersFollowedByMe = await User.findById(userId).select("following user");

		const users = await User.aggregate // get random users
        ([
			{
				$match: 
                {
					_id: { $ne: userId }, // exclude current user from suggestions
				},
			},
			{
				$sample: 
                {
					size: 10, // sample of 10 users
				},
			},
		]);

		// filter out users already followed by current user
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4); // limit suggestions to 4 users

		suggestedUsers.forEach((user) => (user.password = null)); // removing password field from suggested users

		res.status(200).json(suggestedUsers);
	} 
    catch (error)
    {
		console.log("There is an error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

// controller to update user profile information
export const updateUser = async (req, res) => 
{
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try 
    {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "The User was not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) 
        {
			return res.status(400).json({ error: "Kindly provide both current password and new password" });
		}

		if (currentPassword && newPassword) // validate password change
        {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "The current password entered is incorrect" });
            
			if (newPassword.length < 6) 
            {
				return res.status(400).json({ error: "The password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10); // generate salt for hashing the new password
			user.password = await bcrypt.hash(newPassword, salt); // hash and save new password
		}

		if (profileImg) // handle profile image update with Cloudinary
        {
			if (user.profileImg) 
            {	
				// https://res.cloudinary.com/dggtyycje/image/upload/v1729451281/whatsapp_vyglcm.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
				// remove previous profile image from Cloudinary
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url; // update profile image URL
		}

		if (coverImg) // handle cover image update with Cloudinary
        {
			if (user.coverImg) 
            {	// remove the previous cover image from Cloudinary
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url; // update cover image URL
		}

		// update user fields with new data
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// set password is null in response (prevent sending password back)
		user.password = null;

		return res.status(200).json(user);
	} 
    catch (error) 
    {
		console.log("There is an error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
