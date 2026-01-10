const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Optional for now to support non-authenticated predictions
    },
    input: {
        Pregnancies: { type: Number, required: true },
        Glucose: { type: Number, required: true },
        BloodPressure: { type: Number, required: true },
        SkinThickness: { type: Number, required: true },
        Insulin: { type: Number, required: true },
        BMI: { type: Number, required: true },
        DiabetesPedigreeFunction: { type: Number, required: true },
        Age: { type: Number, required: true }
    },
    prediction: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    probability: {
        no_diabetes: Number,
        diabetes: Number
    },
    confidence: Number,
    model_algorithm: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', predictionSchema);
