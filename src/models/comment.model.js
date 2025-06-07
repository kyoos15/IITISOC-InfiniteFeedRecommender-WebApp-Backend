import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    creator: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creator.modelType',
      },
      modelType: {
        type: String,
        required: true,
        enum: ['User', 'Channel'],
      },
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    parent: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'parent.modelType',
        },
        modelType: {
            type: String,
            required: true,
            enum: ['Asset', 'Comment'],
        },
    },

    likes: [
        {
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
        },
    ],

    likesCount: {
        type: Number,
        default: 0,
        min: 0
    },

    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      }
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
