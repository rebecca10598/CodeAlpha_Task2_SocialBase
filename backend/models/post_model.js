import mongoose from "mongoose";

const postSchema = new mongoose.Schema // define a schema for posts
(
	{
		user: // reference to the user who created the post
        {
			type: mongoose.Schema.Types.ObjectId,  // refers to the User model
			ref: "User", // establishes a relationship with "User" collection
			required: true,
		},
		text: 
        {
			type: String,
		},
		img: // URL to image associated with the post (if any)
        {
			type: String,
		},
		likes: 
        [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: 
        [
			{
				text: 
                {
					type: String,
					required: true,
				},
				user: // user who made the comment
                {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema); // create a Mongoose model for the "Post" collection using the postSchema

export default Post;