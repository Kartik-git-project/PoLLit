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

// MODELS FOR STATS
import User from './models/User.js';
import Poll from './models/Poll.js';

const PORT = process.env.PORT || 8000;
const app = express();

// BULLETPROOF CORS MIDDLEWARE
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true); // Allows Vercel frontend without CORS blocks
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

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

// DIRECT INLINE COUNTS ROUTE (No extra file needed)
app.get('/api/counts', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const pollsCount = await Poll.countDocuments();

    const votesData = await Poll.aggregate([
      { $unwind: "$options" },
      { $group: { _id: null, totalVotes: { $sum: "$options.votes" } } }
    ]);

    const totalVotes = votesData.length > 0 ? votesData[0].totalVotes : 0;

    return res.status(200).json({
      success: true,
      data: { users: usersCount, polls: pollsCount, votes: totalVotes }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get('/', (req, res) => {
    res.send("API WORKING");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});