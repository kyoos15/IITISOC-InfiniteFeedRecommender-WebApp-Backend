import Asset from "../models/asset.model";
import Channel from "../models/channel.model";

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
        const parentChannel = await Channel.findByIdUpdate(creator, {
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