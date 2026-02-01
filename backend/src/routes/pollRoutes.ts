import { Router, Request, Response } from 'express';
import { PollService, ChatService } from '../services/PollService';

const router = Router();

// Get active poll in session
router.get('/session/:sessionId/active', async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const result = await PollService.getCurrentPoll(sessionId);

    if (!result) {
      return res.status(404).json({ message: 'No active poll' });
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll results
router.get('/:pollId/results', async (req: Request, res: Response) => {
  try {
    const pollId = String(req.params.pollId);
    const results = await PollService.getResults(pollId);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll history for session
router.get('/session/:sessionId/history', async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId);
    const history = await PollService.getHistory(sessionId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll details
router.get('/:pollId', async (req: Request, res: Response) => {
  try {
    const pollId = String(req.params.pollId);
    const poll = await PollService.getPoll(pollId);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
