import { Router } from 'express';
import { start, getAssessment, updateAssessment, runCode, submit } from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';
import { executionLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/start', authenticate, start);
router.get('/:id', authenticate, getAssessment);
router.patch('/:id', authenticate, updateAssessment);
router.post('/:id/run', authenticate, executionLimiter, runCode);
router.post('/:id/submit', authenticate, submit);

export default router;
