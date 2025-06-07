import jwt from "jsonwebtoken"
import mongoose from "mongoose";

export const generateToken = (userId, res) => {
    const token = jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });

    res.cookie("token", token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    })

    return token;
}


export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect("mongodb://127.0.0.1:27017/mydatabase");

        console.log(`MongoDB connected on host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); 
    }
};
