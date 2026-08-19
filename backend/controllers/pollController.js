import Poll from "../models/Poll.js";
import User from "../models/User.js";
import Comments from "../models/Comments.js";
import { shapePoll } from "../utils/pollShape.js";
import { withCounts } from "../utils/counts.js";
import { v2 as cloudinary } from "cloudinary";

// Helper: Stream Upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "poll_images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const POP = ["creator", "name username avatar"];

// Helper: Big numbers formatting (e.g. 1500 -> 1.5K, 2000000 -> 2M)
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return `${num}`;
};

// GET PUBLIC PLATFORM STATS (NO AUTH REQUIRED)
export const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPolls = await Poll.countDocuments();

    // Summing up total votes cast across all polls
    const votesAggregation = await Poll.aggregate([
      { $project: { voteCount: { $size: { $ifNull: ["$votes", []] } } } },
      { $group: { _id: null, totalVotes: { $sum: "$voteCount" } } }
    ]);

    const totalVotes = votesAggregation[0]?.totalVotes || 0;

    res.json({
      users: formatNumber(totalUsers),
      votes: formatNumber(totalVotes),
      polls: formatNumber(totalPolls),
    });
  } catch (err) {
    console.error("Error in getPublicStats:", err);
    res.status(500).json({ message: err.message });
  }
};

// bookmark id-set for logged-in users
const bookmarkSet = async (userId) => {
  if (!userId) return new Set();
  const me = await User.findById(userId).select("bookmarks");
  return new Set((me?.bookmarks || []).map(String));
};

// to create a poll
export const createPoll = async (req, res) => {
  try {
    const { question, type, category } = req.body;
    if (!question || !type)
      return res.status(400).json({
        message: "Question and type are required",
      });

    let options = [];
    if (type === "yesno") {
      options = [{ text: "Yes" }, { text: "No" }];
    } else if (type === "single") {
      const parsed =
        typeof req.body.options === "string"
          ? JSON.parse(req.body.options || "[]")
          : req.body.options || [];
      options = parsed
        .filter((t) => t && String(t).trim())
        .map((t) => ({ text: String(t).trim() }));
      if (options.length < 2)
        return res.status(400).json({ message: "Add at least 2 options" });
    } else if (type === "image") {
      if (!req.files || req.files.length < 2)
        return res.status(400).json({ message: "Add at least 2 images" });
      const urls = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer))
      );
      options = urls.map((image) => ({ image, text: "" }));
    }

    const poll = await Poll.create({
      creator: req.userId,
      question,
      type,
      category,
      options,
    });
    res.status(201).json(poll);
  } catch (err) {
    console.error("Error in createPoll:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// shared list as a helper function for voted mine feed
const sendList = async (filter, req, res) => {
  const polls = await Poll.find(filter)
    .populate(...POP)
    .sort("-createdAt");

  const set = await bookmarkSet(req.userId);
  const shaped = polls.map((p) => shapePoll(p, req.userId, set));
  res.json(await withCounts(shaped));
};

// listPolls get listed polls
export const listPolls = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type && req.query.type !== "all")
      filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.feed === "following" && req.userId) {
      const me = await User.findById(req.userId).select("following");
      filter.creator = { $in: me?.following || [] };
    }
    await sendList(filter, req, res);
  } catch (err) {
    console.error("Error in listPolls:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// to get own polls
export const getMyPolls = async (req, res) => {
  try {
    await sendList({ creator: req.userId }, req, res);
  } catch (err) {
    console.error("Error in getMyPolls:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// getVotedPolls i.e. the poll which i voted on
export const getVotedPolls = async (req, res) => {
  try {
    await sendList({ "votes.user": req.userId }, req, res);
  } catch (err) {
    console.error("Error in getVotedPolls:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// the polls i bookmark on(GET)
export const getBookmarks = async (req, res) => {
  try {
    const me = await User.findById(req.userId).populate({
      path: "bookmarks",
      populate: { path: "creator", select: "name username avatar" },
    });

    const set = new Set((me?.bookmarks || []).map((p) => String(p._id)));
    const shaped = (me?.bookmarks || []).map((p) =>
      shapePoll(p, req.userId, set)
    );
    res.json(await withCounts(shaped));
  } catch (err) {
    console.error("Error in getBookmarks:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// to get the count of polls per type
export const getTrending = async (req, res) => {
  try {
    const types = ["single", "yesno", "rating", "image", "open"];
    const counts = await Promise.all(
      types.map((t) => Poll.countDocuments({ type: t }))
    );
    res.json(
      types.map((t, i) => ({
        type: t,
        count: counts[i],
      }))
    );
  } catch (err) {
    console.error("Error in getTrending:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// to get single poll (used by shareable public view)
export const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(...POP);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const creatorId = poll.creator?._id || poll.creator;
    const isCreator = String(creatorId) === String(req.userId);
    const skipView = req.query.noview === "true";

    if (!isCreator && !skipView) {
      poll.views = (poll.views || 0) + 1;
      await poll.save();
    }

    const set = await bookmarkSet(req.userId);
    const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
    res.json(shaped);
  } catch (err) {
    console.error("Error in getPoll:", err);
    res.status(500).json({ message: err.message });
  }
};

// to get creator-only stats(no view increment)
export const getPollAnalytics = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(...POP);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (String(poll.creator._id) !== String(req.userId))
      return res.status(403).json({
        message: "Not your poll",
      });

    const shaped = shapePoll(poll, req.userId);
    const comments = await Comments.countDocuments({ poll: poll._id });
    res.json({ poll: shaped, comments });
  } catch (err) {
    console.error("Error in getPollAnalytics:", err);
    res.status(500).json({ message: err.message });
  }
};