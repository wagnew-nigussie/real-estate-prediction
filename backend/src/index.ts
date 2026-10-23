import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import predictionRoutes from "./routes/predictionRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/predict", predictionRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "real-estate-backend",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://127.0.0.1:${PORT}`);
});
