import express from "express";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const pollsList = await Poll.find({});
    
    const pollsCount = pollsList.length;

    let totalVotes = 0;
    pollsList.forEach(poll => {
      // Direct poll.voters / poll.votes array check
      if (Array.isArray(poll.voters)) {
        totalVotes += poll.voters.length;
      } else if (typeof poll.totalVotes === 'number') {
        totalVotes += poll.totalVotes;
      }

      // Options array check
      if (poll.options && Array.isArray(poll.options)) {
        poll.options.forEach(option => {
          if (typeof option.votes === 'number') {
            totalVotes += option.votes;
          } else if (Array.isArray(option.voters)) {
            totalVotes += option.voters.length;
          } else if (Array.isArray(option.votes)) {
            totalVotes += option.votes.length;
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