from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Real Estate ML API", version="1.0")

# Load the trained model at startup
try:
    model = joblib.load('models/price_prediction_model.joblib')
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Define the input data schema
class PropertyFeatures(BaseModel):
    longitude: float
    latitude: float
    housing_median_age: float
    total_rooms: float
    total_bedrooms: float
    population: float
    households: float
    median_income: float

@app.get("/health")
def health_check():
    """Endpoint for Express to check if the ML service is online."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "model": "loaded"}

@app.post("/predict")
def predict_price(features: PropertyFeatures):
    """Endpoint to receive property features and return a predicted price."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Convert the incoming JSON/Pydantic object into a Pandas DataFrame
        input_df = pd.DataFrame([features.model_dump()])
        
        # Predict the price
        prediction = model.predict(input_df)
        
        return {
            "predicted_price": round(float(prediction[0]), 2),
            "currency": "USD"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
