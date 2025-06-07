import Asset from "../models/asset.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/utils.js";
import bcrypt from 'bcrypt'

export const createUser = async (req, res) => {
    const { userName, fullName, email, password, occupation = "",  taggsInterestedIn = ""} = req.body;
    const {file} = req;
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
        let profilePic = null;
        if(file) {
            const cloudResult = await uploadOnCloudinary(file.path);
            if (!cloudResult) {
                return res.status(500).json({ error: "Cloudinary upload failed" });
            }

            profilePic = cloudResult.secure_url;
            fs.unlinkSync(file.path); 
        }

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

            return res.status(201).json({
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

export const toggleLikeInAComment = async (req, res) => {
    const { commentId, likerId } = req.params;

    if (!commentId || !likerId || commentId.trim() === "" || likerId.trim() === "") {
        return res.status(400).json({ message: "Please provide both commentId and likerId" });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(likerId)) {
        return res.status(400).json({ message: "Invalid commentId or likerId" });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        let alreadyLiked = false;

        comment.likes = comment.likes.filter(like => {
            if (like.userOrChannel.toString() === likerId) {
                alreadyLiked = true;
                return false; 
            }
            return true; 
        });

        if (alreadyLiked) {
            comment.likesCount = Math.max(comment.likesCount - 1, 0);
        } else {
            comment.likes.push({ userOrChannel: likerId });
            comment.likesCount = (comment.likesCount || 0) + 1;
        }

        await comment.save();

        return res.status(200).json({
            message: alreadyLiked ? "Like removed" : "Like added",
            likesCount: comment.likesCount,
            likedByUser: !alreadyLiked
        });

    } catch (error) {
        console.error("Error toggling like:", error);
        return res.status(500).json({ message: "Server error while toggling like" });
    }
};

export const postACommentOnAnAsset = async (req, res) => {
    const { commenterId, assetId } = req.params;
    const { content } = req.body;
    if (!commenterId || !assetId || !content || content.trim() === "") {
        return res.status(400).json({ message: "commenterId, assetId and non-empty content are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(commenterId) || !mongoose.Types.ObjectId.isValid(assetId)) {
        return res.status(400).json({ message: "Invalid commenterId or assetId" });
    }

    try {

        const [foundedUser, foundedAsset] = await Promise.all([
            User.findById(commenterId),
            Asset.findById(assetId)
        ]);

        if (!foundedUser || !foundedAsset) {
            return res.status(404).json({ message: "User or Asset not found" });
        }

        const createdComment = await Comment.create({
            creator: {
                id: commenterId,
                modelType: "User"
            },
            content: content.trim(),
            parent: {
                id: assetId,
                modelType: "Asset"
            },
        });
        foundedUser.commentsPosted.push(createdComment._id);
        foundedAsset.comments.push(createdComment._id);
        await Promise.all([foundedUser.save(), foundedAsset.save()]);

        return res.status(201).json({
            message: "Comment posted successfully",
            comment: createdComment
        });

    } catch (error) {
        console.error("Error posting comment:", error);
        return res.status(500).json({ message: "Server error while posting comment" });
    }
};

export const giveAReplyOnComment = async (req, res) => {
    const { commentId, commenterId } = req.params;
    const { content } = req.body;

    if (!commentId || !commenterId || !content || content.trim() === "") {
        return res.status(400).json({ message: "commentId, commenterId, and non-empty content are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(commenterId)) {
        return res.status(400).json({ message: "Invalid commentId or commenterId" });
    }

    try {
        const [parentComment, user] = await Promise.all([
            Comment.findById(commentId),
            User.findById(commenterId)
        ]);

        if (!parentComment || !user) {
            return res.status(404).json({ message: "Comment or User not found" });
        }

        const replyComment = await Comment.create({
            creator: {
                id: commenterId,
                modelType: 'User',
            },
            content: content.trim(),
            parent: {
                id: commentId,
                modelType: 'Comment',
            }
        });

        parentComment.replies.push(replyComment._id);
        user.commentsPosted.push(replyComment._id);

        await Promise.all([
            parentComment.save(),
            user.save()
        ]);

        return res.status(201).json({
            message: "Reply posted successfully",
            reply: replyComment
        });

    } catch (error) {
        console.error("Error posting reply:", error);
        return res.status(500).json({ message: "Server error while replying to comment" });
    }
};