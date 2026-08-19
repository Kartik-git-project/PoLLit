import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNotifications, markRead } from '../controllers/notificationController.js';

const notificationRouter = express.Router();
notificationRouter.use(protect);

notificationRouter.get('/', getNotifications);
notificationRouter.patch('/read', markRead);

export default notificationRouter;