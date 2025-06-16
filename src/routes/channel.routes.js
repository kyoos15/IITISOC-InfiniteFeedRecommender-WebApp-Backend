import express from 'express';
import { createChannel, getChannelById, updateChannel, deleteChannel, getAllChannels, toggleLikeAssetByChannel, addComment } from '../controllers/channelController.js';

const router = express.Router();

router.post('/create', createChannel);
router.get('/getchannelbyid/:channelId', getChannelById); 
router.patch('/update/:channelId', updateChannel);
router.delete('/delete/:id', deleteChannel);
router.get('/all', getAllChannels);
router.patch('/like/:assetId/:channelId', toggleLikeAssetByChannel);
router.post('/comment', addComment);

export default router;
