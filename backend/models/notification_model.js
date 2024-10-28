import mongoose from "mongoose";

// define notification schema
const notificationSchema = new mongoose.Schema
(
	{
		from: 
        {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		to: 
        {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: 
		{
			type: String,
			required: true,
			enum: ["follow", "like", "comment"], 
		},
		read: 
		{
			type: Boolean,
			default: false,
		},
		postId: 
		{ 
			type: mongoose.Schema.Types.ObjectId, // link the notification to specific post
			ref: "Post",
		},
	},
	{ timestamps: true } // automatically add createdAt & updatedAt fields
);

const Notification = mongoose.model("Notification", notificationSchema); // create Notification model

export default Notification;
