import User from "../models/user.model";

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