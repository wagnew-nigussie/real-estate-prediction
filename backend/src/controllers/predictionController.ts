import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';
import prisma from '../services/prismaClient';

export const createPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const propertyData = req.body;
    const userId = req.user?.userId; // Getting the ID from the verified JWT

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, propertyData);
    const predictedPrice = mlResponse.data.predicted_price;

    const savedPrediction = await prisma.prediction.create({
      data: {
        userId: userId,
        longitude: propertyData.longitude,
        latitude: propertyData.latitude,
        housingMedianAge: propertyData.housing_median_age,
        totalRooms: propertyData.total_rooms,
        totalBedrooms: propertyData.total_bedrooms,
        population: propertyData.population,
        households: propertyData.households,
        medianIncome: propertyData.median_income,
        predictedPrice: predictedPrice,
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        predictionId: savedPrediction.id,
        predictedPrice: predictedPrice,
        currency: mlResponse.data.currency
      }
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to process prediction.' });
  }
};
