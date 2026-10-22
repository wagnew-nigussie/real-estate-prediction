import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictionRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Express backend is running securely.' });
});

app.listen(PORT, () => {
  console.log(`✅ Secure Backend server is running on http://localhost:${PORT}`);
});
