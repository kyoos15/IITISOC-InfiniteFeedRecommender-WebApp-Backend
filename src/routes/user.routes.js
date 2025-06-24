import express from "express";
import { createUser, getAllUsers, getUserById, getUserProfile, loginUser, logoutUser, postACommentOnAnAsset, toggleLikeAssetByUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

router.post('/signup', upload.single('profilePic'),createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser)
router.get('/profile/:email', getUserProfile);
router.get('/getallusers', getAllUsers);
router.post('postcommentonasset/:commenterId/:assetId', postACommentOnAnAsset);
router.patch('/likes/:assetId/:userId', toggleLikeAssetByUser)
router.get('/getuserbyid/:id', getUserById);

export default router