import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";
import Asset from "../models/asset.model.js";
import Comment from "../models/comment.model.js";

export const createChannel = async (req, res) => {
    try {
        const { details, bio = "", detailsAboutInsiders } = req.body;

        if (
            !details?.id ||
            !details?.ceo ||
            !details?.officialName ||
            !detailsAboutInsiders?.ceo
        ) {
            return res.status(400).json({
                message:
                    "Missing required fields in 'details' or 'detailsAboutInsiders'.",
            });
        }

        const existingChannel = await Channel.findOne({ "details.id": details.id });
        if (existingChannel) {
            return res
                .status(400)
                .json({ message: "Channel with this ID already exists." });
        }

        const channel = new Channel({
            details,
            bio: bio || "",
            detailsAboutInsiders,
            cntOfUsersSubscribedToIt: 0,
            ListOfUsersSubscribed: [],
            historyOfPostsCreated: [],
            reports: [],
            likesOnPosts: [],
            commentOnPosts: [],
        });

        const savedChannel = await channel.save();
        return res.status(201).json(savedChannel);
    } catch (err) {
        console.error("Error creating channel:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getChannelById = async (req, res) => {
    try {
        const channelId = req.params.id;
        if (!channelId || channelId.length !== 24) {
            return res.status(400).json({ message: "Invalid Channel ID format" });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        return res.status(200).json(channel);
    } catch (err) {
        console.error("Error in getChannelById:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateChannel = async (req, res) => {
    try {
        const channelId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: "Invalid channel ID format" });
        }

        const allowedUpdates = [
            "details",
            "bio",
            "detailsAboutInsiders",
            "ratingOfCommpany",
            "cntOfUsersSubscribedToIt",
            "ListOfUsersSubscribed",
            "reports",
            "likesOnPosts",
            "commentOnPosts",
            "historyOfPostsCreated",
        ];
        const updateKeys = Object.keys(req.body);
        const isValidOperation = updateKeys.every((key) =>
            allowedUpdates.includes(key)
        );

        if (!isValidOperation) {
            return res.status(400).json({ message: "Invalid update fields" });
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        // .populate("details.ceo", "fullName email profilePic")
        // .populate("ListOfUsersSubscribed", "fullName email")
        // .populate("likesOnPosts", "title")
        // .populate("commentOnPosts", "creator content createdAt")
        // .populate("historyOfPostsCreated", "title createdAt thumbnail");

        if (!updatedChannel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        res.status(200).json(updatedChannel);
    } catch (err) {
        console.error("Error updating channel:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteChannel = async (req, res) => {
    try {
        const deleted = await Channel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Channel not found" });
        }

        res.status(200).json({ message: "Channel deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.find().sort({ createdAt: -1 });
        res.status(200).json(channels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleLikeAssetByChannel = async (req, res) => {
    try {
        const { assetId, channelId } = req.params;

        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        const likeIndex = asset.likes.likerArray.findIndex(
            (like) =>
                like.userOrChannel.toString() === channelId && like.kind === "Channel"
        );

        if (likeIndex !== -1) {
            asset.likes.likerArray.splice(likeIndex, 1);
            asset.likes.count = Math.max(0, asset.likesCount - 1);
        } else {
            asset.likes.likerArray.push({
                userOrChannel: channelId,
                kind: "Channel",
            });
            asset.count += 1;
        }

        await asset.save();

        res.status(200).json({
            message:
                likeIndex !== -1 ? "Disliked successfully" : "Liked successfully",
            likesCount: asset.likesCount,
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Server Error" });
    }
}; 

export const addComment = async (req, res) => {
    try {
        const { channelId, assetId, content, parentCommentId } = req.body;

        if (!channelId || !content || (!assetId && !parentCommentId)) {
            return res.status(400).json({
                message: "channelId, content, and either assetId or parentCommentId are required.",
            });
        }

        const isValid = [channelId, assetId, parentCommentId].filter(Boolean).every(id =>
            mongoose.Types.ObjectId.isValid(id)
        );
        if (!isValid) {
            return res.status(400).json({ message: "One or more invalid IDs." });
        }

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }


        const newComment = new Comment({
            creator: {
                id: channelId,
                modelType: "Channel",
            },
            content: content.trim(),
            parent: {
                id: parentCommentId || assetId,
                modelType: parentCommentId ? "Comment" : "Asset",
            },
            likes: [],
            likesCount: 0,
        });

        const savedComment = await newComment.save();

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent comment not found" });
            }

            parentComment.replies.push(savedComment._id);
            await parentComment.save();
        } else {
            const asset = await Asset.findById(assetId);
            if (!asset) {
                return res.status(404).json({ message: "Asset not found" });
            }

            asset.comments.push(savedComment._id);
            await asset.save();
        }

        return res.status(201).json({
            message: "Comment posted successfully",
            comment: savedComment,
        });

    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

