import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './src/utils/utils.js';
import userRoutes from './src/routes/user.routes.js'
import assetRoutes from './src/routes/user.routes.js'

dotenv.config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');


app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, 
    })
);

app.get('/', (req, res)=> {
    res.send('Ishaan is gay, and he is proud of it!')
})


app.use('/api/user', userRoutes);
app.use('/api/asset', assetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
})
