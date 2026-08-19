import "dotenv/config"; // Ensure env loads BEFORE any local imports
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRouter.js';
import notificationRouter from './routes/notificationRoutes.js';
import pollRouter from './routes/pollRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 8000;
const app = express();

console.log("Environment Check:", {
  SMTP_USER: process.env.SMTP_USER ? "LOADED" : "MISSING",
  SMTP_PASS: process.env.SMTP_PASS ? "LOADED" : "MISSING",
  CLOUDINARY: process.env.CLOUDINARY_CLOUD_NAME ? "LOADED" : "MISSING"
});

// MIDDLEWARE
app.use(cors({
    origin: process.env.CLIENT_URL, credentials: true
}));
app.use(express.json());

// DB
connectDB();

// ROUTES
app.use('/api/auth', authRouter); 
app.use('/api/polls', pollRouter); 
app.use('/api/comments', commentRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notificationRouter);

app.get('/', (req, res) => {
    res.send("API WORKING");
});

app.listen(PORT, ()=>{
    console.log(`Server started on http://localhost:${PORT}`);
});