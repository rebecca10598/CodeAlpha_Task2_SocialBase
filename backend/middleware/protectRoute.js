import User from "../models/user_model.js";
import jwt from "jsonwebtoken";

// middleware to protect routes
export const protectRoute = async (req, res, next) => 
{
	try 
    {
		const token = req.cookies.jwt; // get token from cookies
		if (!token) 
        {
			return res.status(401).json({ error: "Unauthorized: No token was provided" }); // handle missing token
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token

		if (!decoded) 
        {
			return res.status(401).json({ error: "Unauthorized: An invalid token was provided" }); // handle invalid token
		}

		const user = await User.findById(decoded.userId).select("-password"); // fetch user without password

		if (!user) 
        {
			return res.status(404).json({ error: "User was not found" }); // handle user not found
		}

		req.user = user;
		next();
	} 
    catch (err) 
    {
		console.log("There is an error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "There is an internal server error" });
	}
};