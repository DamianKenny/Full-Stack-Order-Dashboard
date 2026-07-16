# Full-Stack Order Dashboard

A full-stack order management dashboard with ML-powered sales predictions using Prophet time-series forecasting.

## Features

- Order management (CRUD operations)
- Product inventory tracking
- Revenue analytics and KPIs
- **ML-powered sales predictions** - predicts top-selling products for monthly, quarterly, and yearly periods
- Automated weekly model retraining
- CSV export for predictions

## Tech Stack

### Frontend
- Next.js 16 (React)
- TypeScript
- Tailwind CSS
- Recharts for data visualization

### Backend
- Node.js + Express
- TypeScript
- MongoDB with Mongoose
- Python ML service (Prophet, pandas)

### ML Service
- Facebook Prophet for time-series forecasting
- pandas for data processing
- scikit-learn for metrics

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB** (running locally or remote connection)
- **npm** or **yarn**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/DamianKenny/Full-Stack-Order-Dashboard.git
cd Full-Stack-Order-Dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Set Up ML Service

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

cd ..
```

### 5. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/order-dashboard

# Point to venv Python (has pandas and other ML dependencies)
# Windows example:
PYTHON_INTERPRETER=C:\Users\YourUsername\Documents\Work\Full-Stack-Order-Dashboard\ml-service\venv\Scripts\python.exe

# Mac/Linux example:
# PYTHON_INTERPRETER=/path/to/ml-service/venv/bin/python
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Ensure MongoDB is Running

```bash
# Windows (if MongoDB is installed as a service):
net start MongoDB

# Mac (if using brew):
brew services start mongodb-community

# Or start MongoDB manually:
mongod
```

## Running the Application

You need **two terminal windows** to run the full stack.

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Server runs on http://localhost:5000

### Terminal 2: Frontend Client

```bash
cd frontend
npm run dev
```

Client runs on http://localhost:3000

### Verify It's Working

Open browser to: http://localhost:3000

## ML Predictions Feature

### Overview

The ML module uses Facebook Prophet to forecast future sales. It analyzes historical order data to predict:

- Top products for the next **month**
- Top products for the next **quarter**
- Top products for the next **year**

Each prediction includes:
- Predicted units to be sold
- 80% confidence interval (lower/upper bounds)
- Model version and generation timestamp

### Training the Model

#### Option 1: Manual Training (Dashboard)

1. Go to http://localhost:3000/overview
2. Click the **"🔄 Retrain Model"** button
3. Wait 2-3 minutes for training to complete
4. Predictions will appear automatically

#### Option 2: Automated Training

The backend automatically retrains the model every **Sunday at 2:00 AM** via a cron scheduler.

#### Option 3: Command Line

```bash
# Activate venv first
cd ml-service
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Run training
python train.py

# Deactivate when done
deactivate
```

### CSV Export

Download predictions as CSV:

1. Go to http://localhost:3000/overview
2. Select the period (Month/Quarter/Year)
3. Click **"📥 Export CSV"**

## API Endpoints

### ML Endpoints

```
POST   /api/ml/train                    - Trigger ML training
GET    /api/ml/predictions/:period      - Get predictions (monthly/quarterly/yearly)
GET    /api/ml/top-products/:period     - Get top N predicted products
GET    /api/ml/status                   - Get ML service status
GET    /api/ml/export/:period           - Export predictions as CSV
```

### Order Endpoints

```
GET    /api/orders                      - Get all orders
POST    /api/orders                      - Create order
PUT     /api/orders/:id                  - Update order
DELETE  /api/orders/:id                  - Delete order
```

### Product Endpoints

```
GET    /api/products                    - Get all products
POST    /api/products                    - Create product
PUT     /api/products/:id                - Update product
DELETE  /api/products/:id                - Delete product
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   │   ├── mlController.ts   # ML training & predictions
│   │   │   ├── orderController.ts
│   │   │   └── productController.ts
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── OrderModelMongo.ts
│   │   │   └── ProductModelMongo.ts
│   │   ├── routes/               # API routes
│   │   │   ├── mlRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   └── productRoutes.ts
│   │   ├── schemas/              # MongoDB schemas
│   │   │   └── predictionSchema.ts
│   │   ├── services/
│   │   │   └── scheduler.ts      # Automated weekly retraining
│   │   ├── config/
│   │   │   └── database.ts       # MongoDB connection
│   │   └── server.ts             # Express app entry point
│   ├── .env                      # Backend config (not in git)
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── overview/
│   │   │   └── page.tsx          # Dashboard with ML predictions
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── overview/
│   │   │   ├── PredictedTopProductsChart.tsx  # ML chart
│   │   │   ├── PredictionInsights.tsx
│   │   │   ├── TopProductsChart.tsx
│   │   │   ├── OrderVolumeChart.tsx
│   │   │   └── RevenueByStatusChart.tsx
│   │   ├── OrderTable.tsx
│   │   ├── NewOrderModal.tsx
│   │   └── EditOrderModal.tsx
│   ├── hooks/
│   │   ├── usePredictions.ts     # ML predictions hook
│   │   ├── useOrders.ts
│   │   └── useProducts.ts
│   ├── types/
│   │   ├── prediction.ts
│   │   ├── order.ts
│   │   └── product.ts
│   ├── services/
│   │   └── api.ts                # API client
│   └── .env.local                # Frontend config (not in git)
│
├── ml-service/
│   ├── train.py                  # Main ML pipeline
│   ├── requirements.txt          # Python dependencies
│   ├── README.md
│   ├── START_HERE.md
│   ├── data/
│   │   └── orders_history.csv    # Export CSV from dashboard
│   ├── models/                   # Saved Prophet models
│   │   └── predictions.json      # Generated predictions
│   └── utils/
│       ├── parser.py             # CSV loading & normalization
│       ├── aggregator.py         # Time-series aggregation
│       └── trainer.py            # Prophet training & predictions
│
├── package.json                  # Root workspaces config
└── README.md
```

## Troubleshooting

### "Python not found"

Verify Python is installed:
```bash
python --version
```

Or check Python path:
```bash
# Windows:
where python

# Mac/Linux:
which python3
```

Update `backend/.env` with the correct Python path.

### "No module named 'pandas'"

Ensure you're using the virtual environment Python:

```bash
cd ml-service
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### "MongoDB connection error"

Ensure MongoDB is running:
```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB

# Mac:
brew services list
```

### "Training fails with UnicodeEncodeError"

This is a Windows console encoding issue. The backend has been fixed to handle UTF-8 encoding. If you still see this, ensure:
1. Backend `.env` has `PYTHONIOENCODING=utf-8` in spawn config
2. Restart the backend after code changes

### Backend won't start (port 5000 in use)

Change the port in `backend/.env`:
```env
PORT=5001
```

And update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Development

### Run Tests
```bash
# Backend tests (if configured)
cd backend && npm test

# Frontend tests (if configured)
cd frontend && npm test
```

### Lint
```bash
cd backend && npm run lint
cd frontend && npm run lint
```

## License

MIT