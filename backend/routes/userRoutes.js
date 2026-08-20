import express from 'express';
import { protect } from '../middleware/auth.js';
import { getConnections, getPublicProfile, toggleFollow, deleteAccount } from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.use(protect);

userRouter.delete('/account', deleteAccount); // NEW DELETE ROUTE

userRouter.get('/:username/connections', getConnections);
userRouter.get('/:username', getPublicProfile);

userRouter.post('/:username/follow', toggleFollow);

export default userRouter;