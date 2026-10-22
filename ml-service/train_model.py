import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from urllib.request import urlretrieve

print("1. Downloading Ames Housing Dataset...")
# We use a clean CSV version of the Ames dataset hosted on GitHub for tutorials
url = "https://raw.githubusercontent.com/ageron/handson-ml2/master/datasets/housing/housing.csv"
dataset_path = "../data/housing.csv"
urlretrieve(url, dataset_path)

print("2. Loading Data...")
df = pd.read_csv(dataset_path)

# For this Proof of Concept, we select a few numeric features that most houses have.
# The original dataset has 'median_house_value' as the target.
features = ['longitude', 'latitude', 'housing_median_age', 'total_rooms', 'total_bedrooms', 'population', 'households', 'median_income']
target = 'median_house_value'

# Drop rows where target is missing just in case
df = df.dropna(subset=[target])

X = df[features]
y = df[target]

print("3. Splitting Data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("4. Building Pipeline...")
# A pipeline ensures we apply the exact same preprocessing to training data and future prediction data
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')), # Fill missing values with median
    ('scaler', StandardScaler()),                  # Scale numbers to be between roughly -1 and 1
    ('model', RandomForestRegressor(n_estimators=100, random_state=42))
])

print("5. Training Model (This might take a minute)...")
pipeline.fit(X_train, y_train)

print("6. Evaluating Model...")
predictions = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"   Mean Absolute Error (MAE): ${mae:,.2f}")
print(f"   R-squared (Accuracy): {r2:.4f}")

print("7. Saving Model Pipeline...")
joblib.dump(pipeline, 'models/price_prediction_model.joblib')
print("✅ Done! Model saved to models/price_prediction_model.joblib")
