import jwt from "jsonwebtoken";

// generate a token and set it as a cookie 
export const generateTokenAndSetCookie = (userId, res) => 
{
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, 
	{
		expiresIn: "15d", // token expiry time
	});

    res.cookie("jwt", token, 
	{
		maxAge: 15 * 24 * 60 * 60 * 1000, // cookie max age - 15 days in Milliseconds
		httpOnly: true, // prevents JS from accessing cookies (effective against cookie theft in XSS attacks)
		// protection against CSRF attacks (no cookies being sent with cross-site requests, mitigating the risk of CSRF)
        sameSite: "strict", 
		secure: process.env.NODE_ENV !== "development", // using secure cookies in production
	});
};