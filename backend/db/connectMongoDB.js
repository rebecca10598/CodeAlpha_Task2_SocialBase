import mongoose from "mongoose";

// connect to MongoDB function
const connectMongoDB = async () => 
{
	try 
	{
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} 
	catch (error) 
	{
		console.error(`Error connection to mongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectMongoDB; // export the function for use in server.js