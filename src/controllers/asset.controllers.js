import { addDocToCollection, getOrCreateCollectionFun } from "../../../vectorDB/index.js";
import Asset from "../models/asset.model.js";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";

export const createAsset = async (req, res) => {
    const { creator, source, authors, title, description, urlToCompNewsPage = "", urlToImage, publishedAt, content } = req.body;
    try {
        const createdAsset = await Asset.create({
            creator, source, authors,
            title, description, urlToCompNewsPage, urlToImage,
            publishedAt, content
        })

        if(!createdAsset) {                
            res.status(500).json({ message: "Some problem occured in creating an asset" });
        }
        const parentChannel = await Channel.findByIdAndUpdate(creator, {
            $push: { historyOfPostsCreated: createdAsset._id },
        }, {new: true});

        if(!parentChannel){ 
            return res.status(404).json({
                message: `parentChannel with id: ${creator} doesnt exist or has some discrepances`,
            });
        }
        console.log("the asset is created now and we are now putting relevant data into the vectorDB");
        const getOrCreateVectorDBOfTitle_1 = await getOrCreateCollectionFun({collectionName: "titleVectorDBCollection_1"});
        const getOrCreateVectorDBOfDescription_1 = await getOrCreateCollectionFun({collectionName: "descriptionVectorDBCollection_1"});

        console.log("Connected to vectorDB, adding data to vectorDB ... ...");
        let titleArray = [title];
        let descriptionArray = [description];
        let ids = [createdAsset._id.toString()];

        await addDocToCollection({collection: getOrCreateVectorDBOfTitle_1, documents: titleArray, ids: ids});
        await addDocToCollection({collection: getOrCreateVectorDBOfDescription_1, documents: descriptionArray, ids: ids});
        console.log("All the data successfully added, everything is good, servers are up and running, you are good to go!!");

        return res.status(200).json({
            createdAsset
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const likeAsset = async (req, res) => {
    const { assetId, likerId } = req.params;
    const { kind } = req.body;
    if (
        !mongoose.Types.ObjectId.isValid(assetId) ||
        !mongoose.Types.ObjectId.isValid(likerId) ||
        !['User', 'Channel'].includes(kind)
    ) {
        return res.status(400).json({ message: "Invalid assetId, likerId, or kind" });
    }

    try {
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        const alreadyLiked = asset.likes.likerArray.some(
            (like) =>
                like.userOrChannel.toString() === likerId &&
                like.kind === kind
            );

        if (alreadyLiked) {
            return res.status(400).json({ message: "Asset already liked by this user/channel" });
        }
        asset.likes.likerArray.push({
            userOrChannel: likerId,
            kind: kind,
        });
        asset.likes.count = asset.likes.likerArray.length;
        await asset.save();
        if (kind === "Channel") {
            const channel = await Channel.findById(likerId);
            if (!channel) {
                return res
                    .status(404)
                    .json({ message: "No channel found with the provided ID" });
            }
            channel.likesOnPosts.push(assetId);
            await channel.save();
        } else {
            const user = await User.findById(likerId);
            if (!user) {
                return res
                    .status(404)
                    .json({ message: "No user found with the provided ID" });
            }
            user.likesOnPosts.push(assetId);
            await user.save();
        }        
 
        return res.status(200).json({
            message: "Asset liked successfully",
            likesCount: asset.likes.count,
        });
    } catch (error) {
        console.error("Error liking asset:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateAnAsset = async (req, res) => {
    const {assetId, title, description, urlToCompNewsPage = "", urlToImage, content} = req.body();
    try {
        
    } catch (error) {
        
    }
};

export const getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        console.log("founded assets are: ", assets);
        
        res.status(200).json({
            message: "Assets fetched successfully",
            data: assets,
        });
    } catch (err) {
        console.error("Error fetching assets:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};