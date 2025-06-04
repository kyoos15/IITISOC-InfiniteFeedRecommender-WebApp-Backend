import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './src/routes/user.routes.js'
import assetRoutes from './src/routes/user.routes.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, 
    })
);

app.get('/', (req, res)=> {
    res.send('Ishaan is gay')
})

app.use('/api/user', userRoutes);
app.use('/api/asset', assetRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
})