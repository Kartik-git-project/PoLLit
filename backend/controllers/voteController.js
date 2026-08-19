import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comments.js";
import { notify } from "./notificationController.js";

// to vote on a poll
export const votePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({
            message: "Poll not found"
        });

        if (poll.closed) return res.status(400).json({
            message: "This poll is closed"
        });

        const { value } = req.body;
        if (value === undefined || value === null || value === "") {
            return res.status(400).json({
                message: "Vote value is required"
            });
        }

        // for a user can vote on a poll one time only
        const hadVote = poll.votes.some((v) => String(v.user) === String(req.userId));
        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));

        poll.votes.push({ user: req.userId, value });
        await poll.save();

        if (!hadVote) await notify({ user: poll.creator, actor: req.userId, poll: poll._id, type: "vote" });

        res.json({ message: "Vote recorded" });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// remove your vote(undo)
export const removeVote = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({
            message: "Poll not found"
        });

        if (poll.closed) return res.status(400).json({
            message: "This poll is closed"
        });

        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));
        await poll.save();

        res.json({ message: "Vote removed" });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// only creator can close or delete thier own polls
const ownerGuard = (poll, userId) => poll && String(poll.creator) === String(userId);

// update any poll(of that user)
export const updatePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });
        const { question, category } = req.body;
        if (question !== undefined && question.trim()) poll.question = question.trim();
        if (category !== undefined) poll.category = category;
        await poll.save();
        res.json({ message: "Poll updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// to add/ remove from my bookmark
export const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const id = req.params.id;
        const has = user.bookmarks.some((b) => String(b) === String(id));
        user.bookmarks = has
            ? user.bookmarks.filter((b) => String(b) !== String(id))
            : [...user.bookmarks, id];
        await user.save();
        res.json({ bookmarked: !has });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// to open/close a poll
export const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

        poll.closed = !poll.closed;
        await poll.save();
        res.json({ closed: poll.closed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// to delete a poll and its comment
export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

        await Comment.deleteMany({ poll: poll._id });
        await poll.deleteOne();
        res.json({ message: "Poll deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

