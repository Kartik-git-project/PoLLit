import express from 'express';
import { protect } from '../middleware/auth.js';
import { createPoll, getBookmarks, getMyPolls, getTrending, getVotedPolls, listPolls, getPollAnalytics, getPoll, getPublicStats } from '../controllers/pollController.js';
import { votePoll, removeVote, closePoll, updatePoll, deletePoll, toggleBookmark } from '../controllers/voteController.js';
import { upload } from '../config/cloudinary.js';

const pollRouter = express.Router();

// Public route (no login required for landing stats)
pollRouter.get('/public-stats', getPublicStats);

pollRouter.use(protect);

pollRouter.get('/', listPolls);
pollRouter.post('/', upload.array("images", 4), createPoll);
pollRouter.get('/mine', getMyPolls);

pollRouter.get('/voted', getVotedPolls);
pollRouter.get('/bookmarks', getBookmarks);
pollRouter.get('/trending', getTrending);

pollRouter.get('/:id/analytics', getPollAnalytics);
pollRouter.get('/:id', getPoll);

// vote
pollRouter.post('/:id/vote', votePoll);
pollRouter.delete('/:id/vote', removeVote);
pollRouter.patch('/:id/close', closePoll);

pollRouter.patch('/:id', updatePoll);
pollRouter.delete('/:id', deletePoll);
pollRouter.post('/:id/bookmark', toggleBookmark);

export default pollRouter;