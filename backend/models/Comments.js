import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true
    }, 
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", 
        default: null
    },
    text: {
        type: String, 
        required: true, 
        trim: true
    }
},{
    timestamps: true
});

export default mongoose.model("Comment", commentSchema);