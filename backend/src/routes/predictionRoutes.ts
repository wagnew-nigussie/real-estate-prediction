import { Router } from 'express';
import { createPrediction } from '../controllers/predictionController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Notice verifyToken is added BEFORE createPrediction!
router.post('/', verifyToken, createPrediction);

export default router;
