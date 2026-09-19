import { Router } from 'express';
import { getAdminStats, getAdminUsers, getAdminProblems, getAdminSubmissions } from '../controllers/adminController';
import { getProblemAdmin, createProblem, updateProblem, deleteProblem } from '../controllers/problemController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('admin', 'instructor'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/problems', getAdminProblems);
router.get('/problems/:id', getProblemAdmin);
router.post('/problems', createProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', requireRole('admin'), deleteProblem);
router.get('/submissions', getAdminSubmissions);

export default router;
