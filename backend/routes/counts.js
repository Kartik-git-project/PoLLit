import express from "express";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const pollsList = await Poll.find({});
    
    const pollsCount = pollsList.length;

    // Har poll ke top-level votes array ki length count karna
    let totalVotes = 0;
    pollsList.forEach(poll => {
      if (poll.votes && Array.isArray(poll.votes)) {
        totalVotes += poll.votes.length;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        users: usersCount,
        polls: pollsCount,
        votes: totalVotes
      }
    });
  } catch (error) {
    console.error("Error fetching stats counts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;