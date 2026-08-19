import Notification from "../models/Notification.js";


// create a notification that comes for vote or comment 
export const notify = async({user, actor, poll, type}) => {
    if(!user || String(user) === String(actor)) return; // skit self action
    try{
        await Notification.create({user, actor, poll, type});
    }
    catch{
        // ignore
    }
};

// unread count with the latest notification
export const getNotifications = async (req, res) => {
    try {
        const items = await Notification.find({user: req.userId})
        .populate("actor", "name username avatar")
        .populate("poll", "question")
        .sort("-createdAt")
        .limit(20);

        const unread = await Notification.countDocuments({
            user: req.userId, read : false
        });
        res.json({items, unread});
    } 
    
    catch (err) {
        res.status(500).json({
            message : err.message
        });
    }
}

// to mark all notification as read
export const markRead = async (req, res) => {
    try {
        await Notification.updateMany({
            user: req.userId, read: false
        }, {
            read: true
        });
        res.json({ok: true});
    } 
    
    catch (err) {
        res.status(500).json({
            message : err.message
        });
    }   
}