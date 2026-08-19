import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true                
    },

    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll"
    },

    type: {
        type: String,
        enum: ["vote", "comment"],
        required: true
    },
    
    read: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

export default mongoose.model("Notification", notificationSchema); 