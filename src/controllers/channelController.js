import Channel from "../models/channel.model.js";
import User from "../models/user.model.js"; 
import Asset from "../models/asset.model.js"; 
import Comment from '../models/comment.model.js';


export const createChannel = async (req, res) => {
  try {
    const channel = new Channel(req.body);
    const savedChannel = await channel.save();
    res.status(201).json(savedChannel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("details.ceo", "name email") 
      .populate("historyOfPostsCreated")
      .populate("ListOfUsersSubscribed", "name email")
      .populate("reports")
      .populate("likesOnPosts")
      .populate("commentOnPosts");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateChannel = async (req, res) => {
  try {
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedChannel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(updatedChannel);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    const { assetId } = req.params;
    const channelId = req.user.id; 

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const likeIndex = asset.likes.findIndex(   //checking if already liked or not
      (like) =>
        like.userOrChannel.toString() === channelId &&
        like.kind === "Channel"
    );

    if (likeIndex !== -1) {
      // Already liked → Dislike (remove like)
      asset.likes.splice(likeIndex, 1);
      asset.likesCount = Math.max(0, asset.likesCount - 1); // prevent negative
    } else {
      // Not liked yet → Like
      asset.likes.push({
        userOrChannel: channelId,
        kind: "Channel",
      });
      asset.likesCount += 1;
    }

    await asset.save();

    res.status(200).json({
      message: likeIndex !== -1 ? "Disliked successfully" : "Liked successfully",
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

    // Create a new comment
    const newComment = new Comment({
      creator: {
        id: channelId,
        modelType: 'Channel',
      },
      content,
      parent: {
        id: parentCommentId || assetId,          // if replying to comment, use comment ID, else asset ID
        modelType: parentCommentId ? 'Comment' : 'Asset',
      },
      likes: [],  // initially no likes on comment
    });

    // Save the comment
    const savedComment = await newComment.save();

    // Add this comment's ID to the Asset's comments array
    if (!parentCommentId) {
      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      asset.comments.push(savedComment._id);
      await asset.save();
    } else {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      parentComment.replies = parentComment.replies || [];
      parentComment.replies.push(savedComment._id);
      await parentComment.save();
    }

    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



