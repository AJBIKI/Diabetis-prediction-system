# Diabetes Prediction System

A full-stack machine learning application for predicting diabetes risk using patient health data. Built with Python (ML), Node.js/Express (Backend), React (Frontend), and MongoDB (Database).

## 🎯 Project Overview

This system uses machine learning to predict diabetes based on 8 medical features from the Pima Indians Diabetes Dataset. The ML model compares multiple algorithms (SVM, Logistic Regression, Random Forest) and selects the best performer.

### Features

- **ML Model**: Trains and compares 3 algorithms with comprehensive evaluation
- **REST API**: Flask service for ML predictions with validation
- **Machine Learning Model**: optimizing Random Forest Classifier (Accuracy: 76%, ROC-AUC: 0.86)
- **Interactive UI**: Modern React frontend with dark mode and responsive design
- **User Authentication**: Secure JWT-based login/signup with MongoDB storage
- **User Dashboard**: Interactive charts and history tracking for authenticated users
- **Real-time Predictions**: Instant risk assessment with probability scores
- **RESTful API**: Robust Flask (ML) and Express (Backend) communication
- **Database Integration**: MongoDB Atlas for persistent history storage history

## 📁 Project Structure

```
Antigravity/
├── ml-model/           # Python ML Service
│   ├── app.py          # Flask API server
│   ├── train.py        # Model training pipeline
│   ├── diabetes.csv    # Dataset
│   └── requirements.txt
├── backend/            # Express.js Backend
│   ├── server.js       # Express server
│   ├── models/         # MongoDB models
│   └── package.json
└── frontend/           # React Frontend
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   └── App.css
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. ML Model Setup

```bash
cd ml-model

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model
python train.py

# Start Flask API (port 5000)
python app.py
```

**Expected Output**: Model training will show accuracy metrics, confusion matrix, and save model files.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Make sure MongoDB is running
# Local: Start MongoDB service
# Atlas: Update MONGODB_URI in .env

# Start Express server (port 3000)
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev
```

## 🎮 Usage

1. **Train the Model** (first time):
   ```bash
   cd ml-model
   python train.py
   ```

2. **Start All Services**:
   - **Terminal 1** (ML API): `cd ml-model && python app.py`
   - **Terminal 2** (Backend): `cd backend && npm start`
   - **Terminal 3** (Frontend): `cd frontend && npm run dev`

3. **Access the Application**:
   - Open browser to `http://localhost:5173`
   - Fill in the 8 medical features
   - Click "Get Prediction"
   - View results with probability scores

## 📊 ML Model Details

### Dataset
- **Source**: Pima Indians Diabetes Dataset
- **Samples**: 768 patients
- **Features**: 8 medical measurements
- **Target**: Binary classification (Diabetes/No Diabetes)

### Features
1. **Pregnancies**: Number of times pregnant
2. **Glucose**: Plasma glucose concentration (mg/dL)
3. **BloodPressure**: Diastolic blood pressure (mm Hg)
4. **SkinThickness**: Triceps skinfold thickness (mm)
5. **Insulin**: 2-Hour serum insulin (mu U/ml)
6. **BMI**: Body mass index
7. **DiabetesPedigreeFunction**: Diabetes pedigree function
8. **Age**: Age in years

### Models Trained
- Logistic Regression
- Support Vector Machine (SVM)
- Random Forest Classifier

The training script automatically selects the best model based on F1-score.

### Preprocessing
- Handles missing values (zeros replaced with median)
- Feature scaling using StandardScaler
- Stratified train-test split (80/20)
- 5-fold cross-validation

## 🔌 API Endpoints

### Python ML API (Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/model-info` | GET | Model details and metrics |
| `/predict` | POST | Single prediction |
| `/batch-predict` | POST | Multiple predictions |

### Express Backend API (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/model-info` | GET | ML model information |
| `/api/predict` | POST | Make prediction |
| `/api/history` | GET | Get prediction history |
| `/api/stats` | GET | Get statistics |

### Example Prediction Request

```json
POST http://localhost:3000/api/predict
Content-Type: application/json

{
  "Pregnancies": 6,
  "Glucose": 148,
  "BloodPressure": 72,
  "SkinThickness": 35,
  "Insulin": 0,
  "BMI": 33.6,
  "DiabetesPedigreeFunction": 0.627,
  "Age": 50
}
```

### Example Response

```json
{
  "prediction": 1,
  "result": "Diabetes",
  "probability": {
    "no_diabetes": 0.23,
    "diabetes": 0.77
  },
  "confidence": 0.77,
  "model_algorithm": "Support Vector Machine"
}
```

## 🧪 Testing

### Test ML Model
```bash
cd ml-model
python train.py  # Check output for accuracy metrics
```

### Test Flask API
```bash
# In another terminal
curl http://localhost:5000/health
```

### Test Backend API
```bash
curl http://localhost:3000/api/health
```

## 📝 Development Notes

### Current Status: MVP
- ✅ ML model with high accuracy
- ✅ Complete REST APIs
- ✅ Functional frontend
- ✅ Basic error handling

### For Production Enhancement
- Add user authentication
- Implement data visualization dashboard
- Add model retraining pipeline
- Deploy to cloud (AWS, GCP, Azure)
- Add comprehensive logging
- Implement rate limiting
- Add input validation middleware
- Create automated tests

## 🛠️ Tech Stack

**ML**: Python, scikit-learn, pandas, numpy, matplotlib, Flask

**Backend**: Node.js, Express.js, MongoDB, Mongoose

**Frontend**: React, Vite, CSS3

## ⚠️ Disclaimer

This application is for **educational purposes only**. Always consult healthcare professionals for medical advice and diagnosis.

## 📄 License

MIT License - Feel free to use for learning and development.

---

**Built with focus on ML quality and MVP functionality** 🚀
