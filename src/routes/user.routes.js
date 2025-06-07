import express from "express";
import { createUser, getAllUsers, getUserProfile, loginUser, logoutUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser)
router.get('/profile/:useremail', getUserProfile);
router.get('/getallusers', getAllUsers);

export default router