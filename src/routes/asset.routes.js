import express from 'express'
import { createAsset, getAllAssets, getAssetById, getQueyResult_Taggs } from '../controllers/asset.controllers.js';

const router = express.Router();

router.get('/getallassets', getAllAssets);
router.post('/create', createAsset);
router.get('/getassetbyid/:id', getAssetById);
router.post('/getQueyResult_Taggs/:viewerId', getQueyResult_Taggs);

export default router;