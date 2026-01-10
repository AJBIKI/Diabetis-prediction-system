"""
Diabetes Prediction API
Flask REST API for serving ML predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load model, scaler, and metadata
try:
    model = joblib.load('diabetes_model.pkl')
    scaler = joblib.load('scaler.pkl')
    feature_names = joblib.load('feature_names.pkl')
    metadata = joblib.load('model_metadata.pkl')
    print("✓ Model loaded successfully!")
    print(f"  Algorithm: {metadata['model_name']}")
    print(f"  Accuracy: {metadata['accuracy']*100:.2f}%")
except FileNotFoundError:
    print("❌ Error: Model files not found!")
    print("   Please run 'python train.py' first to train the model.")
    model = None

@app.route('/', methods=['GET'])
def home():
    """API home endpoint with information"""
    if model is None:
        return jsonify({
            'error': 'Model not trained',
            'message': 'Please run train.py first to train the model'
        }), 503
    
    return jsonify({
        'message': 'Diabetes Prediction API',
        'version': '1.0.0',
        'model_info': {
            'algorithm': metadata['model_name'],
            'accuracy': f"{metadata['accuracy']*100:.2f}%",
            'training_samples': metadata['training_samples'],
            'test_samples': metadata['test_samples']
        },
        'endpoints': {
            '/predict': 'POST - Make a prediction',
            '/model-info': 'GET - Get model information',
            '/health': 'GET - Health check'
        },
        'required_features': feature_names
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get detailed model information"""
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    
    return jsonify({
        'algorithm': metadata['model_name'],
        'accuracy': metadata['accuracy'],
        'training_samples': metadata['training_samples'],
        'test_samples': metadata['test_samples'],
        'features': feature_names,
        'feature_descriptions': {
            'Pregnancies': 'Number of times pregnant',
            'Glucose': 'Plasma glucose concentration (mg/dL)',
            'BloodPressure': 'Diastolic blood pressure (mm Hg)',
            'SkinThickness': 'Triceps skin fold thickness (mm)',
            'Insulin': '2-Hour serum insulin (mu U/ml)',
            'BMI': 'Body mass index (weight in kg/(height in m)^2)',
            'DiabetesPedigreeFunction': 'Diabetes pedigree function (genetic factor)',
            'Age': 'Age in years'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Make a diabetes prediction
    
    Expected JSON format:
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
    """
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate that all required features are present
        missing_features = [f for f in feature_names if f not in data]
        if missing_features:
            return jsonify({
                'error': 'Missing required features',
                'missing_features': missing_features,
                'required_features': feature_names
            }), 400
        
        # Extract features in the correct order
        features = [float(data[feature]) for feature in feature_names]
        
        # Validate feature values
        validation_errors = validate_features(data)
        if validation_errors:
            return jsonify({
                'error': 'Invalid feature values',
                'validation_errors': validation_errors
            }), 400
        
        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Scale features
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get probability if available
        probability = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(features_scaled)[0]
            probability = {
                'no_diabetes': float(proba[0]),
                'diabetes': float(proba[1])
            }
        
        # Prepare response
        result = {
            'prediction': int(prediction),
            'result': 'Diabetes' if prediction == 1 else 'No Diabetes',
            'probability': probability,
            'confidence': float(max(proba)) if probability else None,
            'input_features': data,
            'model_algorithm': metadata['model_name']
        }
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({
            'error': 'Invalid data type',
            'message': 'All feature values must be numeric',
            'details': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

def validate_features(data):
    """Validate feature values are within reasonable ranges"""
    errors = []
    
    # Define validation rules
    validations = {
        'Pregnancies': (0, 20, 'Must be between 0 and 20'),
        'Glucose': (0, 300, 'Must be between 0 and 300 mg/dL'),
        'BloodPressure': (0, 200, 'Must be between 0 and 200 mm Hg'),
        'SkinThickness': (0, 100, 'Must be between 0 and 100 mm'),
        'Insulin': (0, 900, 'Must be between 0 and 900 mu U/ml'),
        'BMI': (0, 70, 'Must be between 0 and 70'),
        'DiabetesPedigreeFunction': (0, 3, 'Must be between 0 and 3'),
        'Age': (0, 120, 'Must be between 0 and 120 years')
    }
    
    for feature, (min_val, max_val, message) in validations.items():
        if feature in data:
            value = float(data[feature])
            if value < min_val or value > max_val:
                errors.append(f"{feature}: {message}")
    
    return errors

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Make predictions for multiple patients
    
    Expected JSON format:
    {
        "patients": [
            {...patient1_features...},
            {...patient2_features...}
        ]
    }
    """
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    
    try:
        data = request.get_json()
        
        if 'patients' not in data or not isinstance(data['patients'], list):
            return jsonify({'error': 'Invalid format. Expected {"patients": [...]}'}), 400
        
        patients = data['patients']
        results = []
        
        for idx, patient in enumerate(patients):
            try:
                # Extract and validate features
                features = [float(patient[feature]) for feature in feature_names]
                features_array = np.array(features).reshape(1, -1)
                features_scaled = scaler.transform(features_array)
                
                # Make prediction
                prediction = model.predict(features_scaled)[0]
                
                # Get probability
                probability = None
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba(features_scaled)[0]
                    probability = {
                        'no_diabetes': float(proba[0]),
                        'diabetes': float(proba[1])
                    }
                
                results.append({
                    'patient_index': idx,
                    'prediction': int(prediction),
                    'result': 'Diabetes' if prediction == 1 else 'No Diabetes',
                    'probability': probability,
                    'success': True
                })
                
            except Exception as e:
                results.append({
                    'patient_index': idx,
                    'error': str(e),
                    'success': False
                })
        
        return jsonify({
            'total_patients': len(patients),
            'successful_predictions': sum(1 for r in results if r.get('success')),
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "="*70)
    print("  DIABETES PREDICTION API SERVER")
    print("="*70)
    
    if model is None:
        print("\n⚠️  Warning: Model not loaded!")
        print("   Run 'python train.py' first to train the model.\n")
    else:
        print("\n✅ Ready to serve predictions!")
        print(f"   Model: {metadata['model_name']}")
        print(f"   Accuracy: {metadata['accuracy']*100:.2f}%\n")
    
    print("🚀 Starting server on http://127.0.0.1:5000")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
