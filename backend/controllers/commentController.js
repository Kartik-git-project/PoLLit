import Comment from "../models/Comments.js";
import Poll from "../models/Poll.js";
import { notify } from "./notificationController.js";

// to get all comments for a poll
export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ poll: req.params.pollId })
            .populate("user", "name username avatar")
            .sort("-createdAt");
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// to add a comment to a poll
export const addComment = async (req, res) => {
    try {
        const text = (req.body.text || "").trim();
        if (!text) return res.status(400).json({
            message: "Comment cannot be empty"
        });

        const comment = await Comment.create({
            poll: req.params.pollId,
            user: req.userId,
            parent: req.body.parent || null,
            text
        });

        const populated = await comment.populate("user", "name username avatar");
        const poll = await Poll.findById(req.params.pollId).select("creator");
        if (poll) await notify({
            user: poll.creator,
            actor: req.userId,
            poll: poll._id,
            type: "comment"
        });

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// author want to remove the comment (+ its replies)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({
            message: "Comment not found"
        });

        if (String(comment.user) !== String(req.userId)) {
            return res.status(403).json({
                message: "Not your comment"
            });
        }

        await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};