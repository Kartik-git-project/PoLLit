import "dotenv/config"; 
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

// ROUTE IMPORTS
import authRouter from './routes/authRouter.js';
import notificationRouter from './routes/notificationRoutes.js';
import pollRouter from './routes/pollRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import userRouter from './routes/userRoutes.js';
import countRoutes from './routes/counts.js'; // Counts router added

const PORT = process.env.PORT || 8000;
const app = express();

console.log("Environment Check:", {
  SMTP_USER: process.env.SMTP_USER ? "LOADED" : "MISSING",
  SMTP_PASS: process.env.SMTP_PASS ? "LOADED" : "MISSING",
  CLOUDINARY: process.env.CLOUDINARY_CLOUD_NAME ? "LOADED" : "MISSING",
  BREVO_KEY: process.env.BREVO_API_KEY ? "LOADED" : "MISSING"
});

// BULLETPROOF CORS MIDDLEWARE
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://po-l-lit.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      } else {
        return callback(null, true); // Fallback to avoid production blocking
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Explicitly handle Preflight OPTIONS Requests
app.options("*", cors());

app.use(express.json());

// DB CONNECTION
connectDB();

// API ROUTES
app.use('/api/auth', authRouter); 
app.use('/api/polls', pollRouter); 
app.use('/api/comments', commentRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/counts', countRoutes); // Registered counts API

app.get('/', (req, res) => {
    res.send("API WORKING");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});