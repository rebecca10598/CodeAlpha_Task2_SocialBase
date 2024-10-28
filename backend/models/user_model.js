import mongoose from "mongoose";

const userSchema = new mongoose.Schema
(
	{
		username: 
        {
			type: String,
			required: true,
			unique: true, // each username must be unique
		},

		fullName: 
        {
			type: String,
			required: true,
		},

		password: // user's hashed password
        {
			type: String,
			required: true,
			minLength: 6,
		},

		email: 
        {
			type: String,
			required: true,
			unique: true,
		},

		followers: // array of users who follow this user
        [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],

		following: // array of users this user is following
        [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],

		profileImg: // URL to user's profile image
        {
			type: String,
			default: "",
		},

		coverImg: // URL to user's cover image
        {
			type: String,
			default: "",
		},

		bio: 
        {
			type: String,
			default: "",
		},

		link: // personal link or website for the user
        {
			type: String,
			default: "",
		},
		likedPosts: // array of posts user has liked
		[
			{
			
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema); // create a Mongoose model for the "User" collection using the userSchema

export default User;