import { Router } from 'express';
import { chat, explain, reviewApproach, hint, debug, dryRun, optimize, getHistory } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.post('/chat', chat);
router.post('/explain', explain);
router.post('/review-approach', reviewApproach);
router.post('/hint', hint);
router.post('/debug', debug);
router.post('/dry-run', dryRun);
router.post('/optimize', optimize);
router.get('/history/:assessmentId', getHistory);

export default router;
