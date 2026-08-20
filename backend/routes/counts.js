import express from "express";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
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