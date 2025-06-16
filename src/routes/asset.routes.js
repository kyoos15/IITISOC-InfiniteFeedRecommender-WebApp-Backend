import express from 'express'
import { createAsset, getAllAssets } from '../controllers/asset.controllers.js';

const router = express.Router();

router.get('/getallassets', getAllAssets);
router.post('/create', createAsset);

export default router;