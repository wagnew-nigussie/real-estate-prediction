import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';
import prisma from '../services/prismaClient';

export const createPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const propertyData = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // 1. Call FastAPI ML Service
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, propertyData);
    const predictedPriceEtb = mlResponse.data.predicted_price_etb;

    // 2. Save to PostgreSQL using the new Ethiopian schema
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId: userId,
        sizeSqm: propertyData.size_sqm,
        propertyType: propertyData.property_type,
        subcity: propertyData.subcity,
        numBedrooms: propertyData.num_bedrooms ?? null,
        numBathrooms: propertyData.num_bathrooms ?? null,
        floor: propertyData.floor ?? null,
        year: propertyData.year ?? 2024,
        latitude: propertyData.lat ?? null,
        longitude: propertyData.lng ?? null,
        distMeskel: propertyData.dist_meskel_square ?? null,
        distAratKilo: propertyData.dist_arat_kilo ?? null,
        distPiassa: propertyData.dist_piassa ?? null,
        predictedPriceEtb: predictedPriceEtb,
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        predictionId: savedPrediction.id,
        predictedPrice: predictedPriceEtb,
        currency: mlResponse.data.currency
      }
    });

  } catch (error: any) {
    console.error("Prediction error:", error.message);
    res.status(500).json({ status: 'error', message: 'Failed to process prediction. Ensure ML service is running.' });
  }
};
