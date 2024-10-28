import bcrypt from "bcryptjs";
import User from "../models/user_model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generate_token.js";

// signup controller
export const signup = async (req, res) => 
{
	try 
    {
		const { fullName, username, email, password } = req.body; // destructure user info from request body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        // emailRegex - used to validate whether given string is in the format of a valid email id
		if (!emailRegex.test(email)) 
        {
			return res.status(400).json({ error: "You have provided an invalid email format" });
		}

		const existingUser = await User.findOne({ username }); // checking for existing username
		if (existingUser) 
        {
			return res.status(400).json({ error: "The username has already been taken!" });
		}

		const existingEmail = await User.findOne({ email }); // checking for existing email
		if (existingEmail) 
        {
			return res.status(400).json({ error: "The email has already been taken" });
		}

		if (password.length < 6) // validating password length
        {
			return res.status(400).json({ error: "The password must be at least 6 characters long" });
		}

        // hashing the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

        // creating a new user instance
		const newUser = new User
        ({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

        // save the new user to the database
		if (newUser) 
        {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			// return user data excluding the password
			res.status(201).json
            ({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} 
        else 
        {
			res.status(400).json({ error: "You have provided invalid User information" });
		}
	} 
    catch (error) 
    {
		console.error("There is an error in the Signup controller", error.message);
		if (error.name === 'MongoNetworkError') 
        {
			return res.status(500).json({ error: "There is a database connection error" });
		}
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// login controller
export const login = async (req, res) => 
{
    try 
    {
		const { username, password } = req.body;
		const user = await User.findOne({ username }); // find user by username
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); // compare passwords

		if (!user || !isPasswordCorrect)  // validating user and password
        {
			return res.status(400).json({ error: "You have provided an invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json
        ({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} 
    catch (error) 
    {
		console.log("There is an error in the Login controller", error.message);
		res.status(500).json({ error: "There is an internal server error" });
	}
};
// logout controller
export const logout = async (req, res) => 
{
	try 
    {
		res.cookie("jwt", "", { maxAge: 0 }); // clear the cookie
		res.status(200).json({ message: "You have been Logged out successfully" });
	} 
    catch (error) 
    {
		console.log("There is an error in the  Logout controller", error.message);
		res.status(500).json({ error: "There is an internal server error" });
	}
};

// get current user info
export const getMe = async (req, res) => 
{
	try 
    {
		const user = await User.findById(req.user._id).select("-password"); // fetch user info excluding the password
		res.status(200).json(user);
	} 
    catch (error) 
    {
		console.log("There is an error in the getMe controller", error.message);
		res.status(500).json({ error: "There is an internal server error" });
	}
};
