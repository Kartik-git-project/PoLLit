import express from "express";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const pollsList = await Poll.find({});
    
    const pollsCount = pollsList.length;

    // Har poll ke sabhi options se total votes Calculate karo
    let totalVotes = 0;
    pollsList.forEach(poll => {
      if (poll.options && Array.isArray(poll.options)) {
        poll.options.forEach(option => {
          // Check karo votes field Number hai ya voters Array
          if (typeof option.votes === 'number') {
            totalVotes += option.votes;
          } else if (Array.isArray(option.voters)) {
            totalVotes += option.voters.length;
          }
        });
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