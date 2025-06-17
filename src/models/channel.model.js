import mongoose, { mongo } from "mongoose";

const channelSchema = mongoose.Schema({
    details: {
        type: {
            id: {
                type: String,
                require: true,
            },
            ceo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                require: true,
            },
            officialName: { // BSE listed / MCA listed full name
                type: String,
                require: true,
            },
            parentCompanyIfAny: {
                type: String // BSE listed / MCA listed full name
            }
        },
    },
    historyOfPostsCreated: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Asset",
            }
        ]
    },
    bio: {
        type: String,
        default: "",
    },
    detailsAboutInsiders: {
        type: {
            ceo: {
                type: String, // email.
                required: true,
            },
            contentManagement: {
                type: String,
            },
            boardOfDirectors: { // if any ofc
                type: String,
            }
        },
        require: true,
    },
    ratingOfCommpany: {
        type: Number,
        min: 0.0,
        max: 10.0,
    },
    cntOfUsersSubscribedToIt: {
        type: Number,
        min: 0,
        default: 0,
    }, 
    ListOfUsersSubscribed: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    reports: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Notification",
            }
        ]
    },
    likesOnPosts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Asset',
            }
        ]
    },
    commentOnPosts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
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

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;