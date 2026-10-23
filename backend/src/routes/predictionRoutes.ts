import { Router } from 'express';
import { createPrediction, getHistory } from '../controllers/predictionController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', verifyToken, createPrediction);
router.get('/history', verifyToken, getHistory);

export default router;
