import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../controllers/problemController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getProblems);
router.get('/:id', authenticate, getProblemById);
router.post('/', authenticate, requireRole('admin', 'instructor'), createProblem);
router.put('/:id', authenticate, requireRole('admin', 'instructor'), updateProblem);
router.delete('/:id', authenticate, requireRole('admin'), deleteProblem);

export default router;
