import jwt from "jsonwebtoken"
import Channel from "../models/channel.model";

export const checkChannelRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    console.log("If you are seeing this message, then you have a token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const channel = await Channel.findById(decoded.id).select("-password");
    if (!channel) {
      return res.status(404).json({ message: "You are surely doing some bullshit, either you are user or pysco" });
    }

    req.channel = channel; 
    next(); 
  } catch (error) {
    console.log("Error in checkChannelRoute middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};