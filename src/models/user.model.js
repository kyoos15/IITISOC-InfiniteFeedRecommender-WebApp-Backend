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
        // enum of [student, professional]
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
        }
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;