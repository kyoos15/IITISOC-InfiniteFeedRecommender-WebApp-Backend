import mongoose, { MongooseError } from "mongoose";

const assetModel = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
    },
    source: {
        type: {
            id: {
                type: String,
                require: true,
            },
            name: {
                type: String,
            }
        },
        require: true,
    },
    taggs: {
        type: [
            {
                type: String,
            }
        ],
        require: true,
    },
    authors: {
        type: [
            {
                type: {
                    dbUser: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    name: {
                        type: String,
                    }
                }
            }
        ],
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    urlToCompNewsPage: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=]*)?$/.test(v);
            },
            message: props => `${props.value} is not a valid URL`
        }
    },
    urlToImage: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=]*)?$/.test(v);
            },
            message: props => `${props.value} is not a valid URL`
        }
    },
    publishedAt: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    likes: {
        likerArray: {
            type: [
                {
                    type: {
                        userOrChannel: {
                            type: mongoose.Schema.Types.ObjectId,
                            required: true,
                            refPath: 'likes.kind',
                        },
                        kind: {
                            type: String,
                            required: true,
                            enum: ['User', 'Channel'], 
                        },
                    }
                }
            ]
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
        }
    },
    comments: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ]
    }

}, {timestamps: true });

const Asset = mongoose.model("Asset", assetModel);

export default Asset