import express from 'express'
import { createAsset, getAllAssets, getAssetById } from '../controllers/asset.controllers.js';

const router = express.Router();

router.get('/getallassets', getAllAssets);
router.post('/create', createAsset);
router.get('/getassetbyid/:id', getAssetById);

export default router;