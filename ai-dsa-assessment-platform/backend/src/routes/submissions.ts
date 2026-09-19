import { Router } from 'express';
import { getSubmissions, getSubmissionById } from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSubmissions);
router.get('/:id', authenticate, getSubmissionById);

export default router;
