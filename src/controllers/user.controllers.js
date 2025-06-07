import User from "../models/user.model.js";
import { generateToken } from "../utils/utils.js";

export const createUser = async (req, res) => {
    const { userName, fullName, email, password, profilePic = "", occupation = "",  taggsInterestedIn = ""} = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const existingUser = await User.find({ email });
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }
        const taggsInterestedInArray = taggsInterestedIn
            .split(",")            
            .map(tag => tag.trim())
            .filter(tag => tag); 

        const user = await User.create({
            userName,
            fullName,
            email,
            password: hashedPassword,
            profilePic: profilePic ? profilePic : null,
            occupation,
            InterestModel: {
                taggsInterestedIn: taggsInterestedInArray, 
            },
        });
        if(user){
            generateToken(user._id, res);
            await user.save();

            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            })
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentails"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentails"});
        }
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
        
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUserProfile = async (req, res) => {
    const { email } = req.params;
    try {
        const emails = Array.isArray(email) ? email : [email];
        const users = await User.find({ email: { $in: emails } });
        console.log(users);
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if(users.length === 0 || !users){
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

