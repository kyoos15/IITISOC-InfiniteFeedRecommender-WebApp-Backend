import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
        type: String,  
        default: "",  
    },
    channelSubscribedTo: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Channel",
            }
        ]
    },
    friends: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    isAccessLimited: {
        type: Boolean,
        default: false,
    },
    commentsPosted: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            }
        ]
    },
    occupation: {
        type: String,
        enum: ['Student', 'Professional', 'Researcher', 'Educator', 'Other'],
        required: true,
        default: 'Student',
    },
    likesOnPosts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Asset',
            }
        ]
    },
    InterestModel: {
        type: {
            taggsInterestedIn: {
                type: [
                    {
                        type: [ String ],
                    }
                ]
            },
            taggsNotInterestedIn: {
                type: [
                    {
                        type: [ String ],
                    }
                ]
            },
            previous10ArticleHistory: {
                type: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Asset',
                    }
                ]
            }
        },
        default: () => ({}),
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;