const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Prediction = require('./models/Prediction');
const authController = require('./controllers/authController');
const { protect, optionalAuth } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('✗ MongoDB Connection Error:', err.message);
        console.error('  Check your MONGODB_URI in .env and ensure Atlas IP whitelist includes your IP.');
        process.exit(1); // Exit so the process doesn't run in a broken state
    }
};

connectDB();

// Log subsequent connection events
mongoose.connection.on('disconnected', () => console.warn('⚠ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✓ MongoDB reconnected'));

// API Routes

// Authentication routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', protect, authController.getMe);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Diabetes Prediction Backend',
        timestamp: new Date().toISOString()
    });
});

// Get model info from Python service
app.get('/api/model-info', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.PYTHON_API_URL}/model-info`);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({
            error: 'Python ML service unavailable',
            message: 'Make sure the Python API is running on port 5000'
        });
    }
});

// Make prediction (with optional authentication)
app.post('/api/predict', optionalAuth, async (req, res) => {
    try {
        const inputData = req.body;

        // Forward request to Python ML service
        const response = await axios.post(`${process.env.PYTHON_API_URL}/predict`, inputData);

        const predictionResult = response.data;

        // Save to database
        try {
            const prediction = new Prediction({
                userId: req.user ? req.user._id : null,  // Save user ID if authenticated
                input: inputData,
                prediction: predictionResult.prediction,
                result: predictionResult.result,
                probability: predictionResult.probability,
                confidence: predictionResult.confidence,
                model_algorithm: predictionResult.model_algorithm
            });

            await prediction.save();

            // Add database ID to response
            predictionResult.id = prediction._id;
        } catch (dbError) {
            console.log('Warning: Could not save to database:', dbError.message);
            // Continue even if database save fails
        }

        res.json(predictionResult);

    } catch (error) {
        if (error.response) {
            // Error from Python service
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'ML service unavailable',
                message: 'Python ML service is not running. Please start it with: python app.py'
            });
        } else {
            res.status(500).json({
                error: 'Prediction failed',
                message: error.message
            });
        }
    }
});

// Get prediction history (protected - only user's own predictions)
app.get('/api/history', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const predictions = await Prediction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            total: predictions.length,
            predictions
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch history',
            message: error.message
        });
    }
});

// Get prediction by ID
app.get('/api/history/:id', async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        res.json(prediction);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch prediction',
            message: error.message
        });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalPredictions = await Prediction.countDocuments();
        const diabetesCount = await Prediction.countDocuments({ prediction: 1 });
        const noDiabetesCount = await Prediction.countDocuments({ prediction: 0 });

        res.json({
            total_predictions: totalPredictions,
            diabetes_predictions: diabetesCount,
            no_diabetes_predictions: noDiabetesCount,
            diabetes_percentage: totalPredictions > 0 ? (diabetesCount / totalPredictions * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('  DIABETES PREDICTION BACKEND API');
    console.log('='.repeat(70));
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`\n📡 Endpoints:`);
    console.log(`   GET  /api/health         - Health check`);
    console.log(`   GET  /api/model-info     - Get ML model information`);
    console.log(`   POST /api/predict        - Make prediction`);
    console.log(`   GET  /api/history        - Get prediction history`);
    console.log(`   GET  /api/stats          - Get statistics`);
    console.log('\n' + '='.repeat(70) + '\n');
});
