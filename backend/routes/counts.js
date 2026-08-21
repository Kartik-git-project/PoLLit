import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const pollsList = await Poll.find({});
    const pollsCount = pollsList.length;

    // 1. Poll documents ke votes array check karo
    let totalVotes = 0;
    pollsList.forEach(poll => {
      if (poll.votes && Array.isArray(poll.votes)) {
        totalVotes += poll.votes.length;
      }
    });

    // 2. Fallback: Agar Vote ka koi alag Model / Collection ho
    if (totalVotes === 0) {
      try {
        const VoteModel = mongoose.models.Vote || mongoose.model("Vote");
        totalVotes = await VoteModel.countDocuments();
      } catch (err) {
        // Separate vote collection missing hai toh direct DB raw collection check
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasVotesColl = collections.some(c => c.name === 'votes');
        if (hasVotesColl) {
          totalVotes = await mongoose.connection.db.collection('votes').countDocuments();
        }
      }
    }

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