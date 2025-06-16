import Asset from "../models/asset.model.js";
import Channel from "../models/channel.model.js";

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

        return res.status(200).json({
            createdAsset
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const likeAsset = async (req, res) => {
    const { assetId, likerId } = req.params;
    try {
        const foundedAsset = await Asset.findById(assetId);
        if(!foundedAsset){
            return res.status(404).json({ message: "Asset not found" });
        }
        const currLikes = foundedAsset.likes.count;
        foundedAsset.likes.likerArray.push(likerId);
        foundedAsset.likes.count = currLikes + 1;
        await foundedAsset.save();

        return res.status(200).json({ message: "liking an asset done" });
    } catch (error) {   
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateAnAsset = async (req, res) => {
    const {assetId, title, description, urlToCompNewsPage = "", urlToImage, content} = req.body();
    try {
        
    } catch (error) {
        
    }
}

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