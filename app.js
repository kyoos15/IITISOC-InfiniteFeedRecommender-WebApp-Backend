import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDB} from './src/utils/utils.js';
import userRoutes from './src/routes/user.routes.js';
import assetRoutes from './src/routes/asset.routes.js';
import authRoutes from './src/routes/auth.routes.js'; 

dotenv.config();

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/asset', assetRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
