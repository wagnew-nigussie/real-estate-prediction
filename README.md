# Real Estate Price Prediction System

A full-stack, microservice-based web application that leverages Machine Learning to predict real estate market values based on property features and demographic data.

## 🏗️ System Architecture
This project implements an industry-standard 3-tier microservice architecture:
1. **UI Tier (Frontend):** React + Vite + Tailwind CSS. 
2. **API Tier (Backend):** Node.js + Express + PostgreSQL.
3. **AI Tier (Machine Learning):** Python + FastAPI + Scikit-Learn.

## 💻 Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt
* **Database:** PostgreSQL (Docker)
* **Machine Learning:** Python, FastAPI, Scikit-Learn

## 🚀 How to Run
1. Database: docker compose up -d
2. ML Service: cd ml-service && uvicorn main:app --port 8000
3. Backend: cd backend && npm run dev
4. Frontend: cd frontend && npm run dev
