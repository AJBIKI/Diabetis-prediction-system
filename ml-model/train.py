"""
Diabetes Prediction Model Training Script
Uses Pima Indians Diabetes Dataset to train and evaluate multiple ML models
Focus: High-quality ML model with comprehensive evaluation
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    roc_curve
)
import joblib
import warnings
warnings.filterwarnings('ignore')

class DiabetesPredictor:
    def __init__(self, data_path='diabetes.csv'):
        """Initialize the predictor with dataset path"""
        self.data_path = data_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scaler = StandardScaler()
        self.best_model = None
        self.model_name = None
        
    def load_data(self):
        """Load and display basic information about the dataset"""
        print("="*70)
        print("STEP 1: LOADING DATASET")
        print("="*70)
        
        self.df = pd.read_csv(self.data_path)
        print(f"\n✓ Dataset loaded successfully!")
        print(f"  - Total samples: {len(self.df)}")
        print(f"  - Features: {len(self.df.columns) - 1}")
        print(f"  - Target: Outcome (0=No Diabetes, 1=Diabetes)")
        
        print("\n📊 Dataset Preview:")
        print(self.df.head())
        
        print("\n📈 Dataset Statistics:")
        print(self.df.describe())
        
        # Check class distribution
        print("\n🎯 Class Distribution:")
        outcome_counts = self.df['Outcome'].value_counts()
        print(f"  - No Diabetes (0): {outcome_counts[0]} ({outcome_counts[0]/len(self.df)*100:.1f}%)")
        print(f"  - Diabetes (1): {outcome_counts[1]} ({outcome_counts[1]/len(self.df)*100:.1f}%)")
        
        return self
    
    def preprocess_data(self):
        """Preprocess the data: handle missing values and prepare features"""
        print("\n" + "="*70)
        print("STEP 2: DATA PREPROCESSING")
        print("="*70)
        
        # Check for missing values (zeros in medical data are often missing values)
        print("\n🔍 Checking for zero values in medical features:")
        zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
        
        for col in zero_cols:
            zero_count = (self.df[col] == 0).sum()
            if zero_count > 0:
                print(f"  - {col}: {zero_count} zeros found")
                # Replace zeros with median for these features
                median_value = self.df[self.df[col] != 0][col].median()
                self.df[col] = self.df[col].replace(0, median_value)
                print(f"    → Replaced with median: {median_value:.2f}")
        
        # Separate features and target
        X = self.df.drop('Outcome', axis=1)
        y = self.df['Outcome']
        
        # Split the data with stratification
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"\n✓ Data split completed:")
        print(f"  - Training set: {len(self.X_train)} samples")
        print(f"  - Test set: {len(self.X_test)} samples")
        
        # Feature scaling
        self.X_train = self.scaler.fit_transform(self.X_train)
        self.X_test = self.scaler.transform(self.X_test)
        
        print(f"\n✓ Feature scaling applied (StandardScaler)")
        
        return self
    
    def train_models(self):
        """Train multiple models and compare performance"""
        print("\n" + "="*70)
        print("STEP 3: MODEL TRAINING & EVALUATION")
        print("="*70)
        
        # Define models to train
        models = {
            'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
            'Support Vector Machine': SVC(kernel='rbf', probability=True, random_state=42),
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42)
        }
        
        results = {}
        
        print("\n🤖 Training and evaluating models...\n")
        
        for name, model in models.items():
            print(f"{'─'*70}")
            print(f"Training: {name}")
            print(f"{'─'*70}")
            
            # Train the model
            model.fit(self.X_train, self.y_train)
            
            # Make predictions
            y_pred = model.predict(self.X_test)
            y_pred_proba = model.predict_proba(self.X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            
            # Calculate metrics
            accuracy = accuracy_score(self.y_test, y_pred)
            precision = precision_score(self.y_test, y_pred)
            recall = recall_score(self.y_test, y_pred)
            f1 = f1_score(self.y_test, y_pred)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='accuracy')
            
            results[name] = {
                'model': model,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'y_pred': y_pred,
                'y_pred_proba': y_pred_proba
            }
            
            print(f"  Accuracy:  {accuracy*100:.2f}%")
            print(f"  Precision: {precision*100:.2f}%")
            print(f"  Recall:    {recall*100:.2f}%")
            print(f"  F1-Score:  {f1*100:.2f}%")
            print(f"  CV Score:  {cv_scores.mean()*100:.2f}% (±{cv_scores.std()*100:.2f}%)")
            print()
        
        # Select best model based on F1 score (balanced metric)
        best_model_name = max(results, key=lambda x: results[x]['f1'])
        self.best_model = results[best_model_name]['model']
        self.model_name = best_model_name
        
        print(f"{'='*70}")
        print(f"🏆 BEST MODEL: {best_model_name}")
        print(f"   F1-Score: {results[best_model_name]['f1']*100:.2f}%")
        print(f"{'='*70}\n")
        
        # Detailed evaluation of best model
        self._detailed_evaluation(results[best_model_name])
        
        return self
    
    def _detailed_evaluation(self, result):
        """Show detailed evaluation metrics for the best model"""
        print("\n" + "="*70)
        print("STEP 4: DETAILED MODEL EVALUATION")
        print("="*70)
        
        y_pred = result['y_pred']
        
        # Confusion Matrix
        cm = confusion_matrix(self.y_test, y_pred)
        print("\n📊 Confusion Matrix:")
        print(f"                 Predicted")
        print(f"                 No    Yes")
        print(f"Actual  No     {cm[0][0]:4d}  {cm[0][1]:4d}")
        print(f"        Yes    {cm[1][0]:4d}  {cm[1][1]:4d}")
        
        # Classification Report
        print("\n📋 Classification Report:")
        print(classification_report(self.y_test, y_pred, target_names=['No Diabetes', 'Diabetes']))
        
        # ROC-AUC Score
        if result['y_pred_proba'] is not None:
            roc_auc = roc_auc_score(self.y_test, result['y_pred_proba'])
            print(f"📈 ROC-AUC Score: {roc_auc:.4f}")
        
    def save_model(self):
        """Save the trained model and scaler"""
        print("\n" + "="*70)
        print("STEP 5: SAVING MODEL")
        print("="*70)
        
        # Save model
        joblib.dump(self.best_model, 'diabetes_model.pkl')
        print(f"\n✓ Model saved: diabetes_model.pkl")
        print(f"  Algorithm: {self.model_name}")
        
        # Save scaler
        joblib.dump(self.scaler, 'scaler.pkl')
        print(f"✓ Scaler saved: scaler.pkl")
        
        # Save feature names
        feature_names = self.df.drop('Outcome', axis=1).columns.tolist()
        joblib.dump(feature_names, 'feature_names.pkl')
        print(f"✓ Feature names saved: feature_names.pkl")
        
        # Save model metadata
        metadata = {
            'model_name': self.model_name,
            'accuracy': accuracy_score(self.y_test, self.best_model.predict(self.X_test)),
            'feature_names': feature_names,
            'training_samples': len(self.X_train),
            'test_samples': len(self.X_test)
        }
        joblib.dump(metadata, 'model_metadata.pkl')
        print(f"✓ Metadata saved: model_metadata.pkl")
        
        print("\n✅ All model artifacts saved successfully!")
        
        return self
    
    def visualize_results(self):
        """Create visualizations for the model performance"""
        print("\n" + "="*70)
        print("STEP 6: GENERATING VISUALIZATIONS")
        print("="*70)
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Diabetes Prediction Model - Performance Analysis', fontsize=16, fontweight='bold')
        
        # 1. Feature Importance (for Random Forest) or Feature Correlation
        ax1 = axes[0, 0]
        if isinstance(self.best_model, RandomForestClassifier):
            feature_names = self.df.drop('Outcome', axis=1).columns
            importances = self.best_model.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            ax1.barh(range(len(importances)), importances[indices], color='steelblue')
            ax1.set_yticks(range(len(importances)))
            ax1.set_yticklabels([feature_names[i] for i in indices])
            ax1.set_xlabel('Importance')
            ax1.set_title('Feature Importance')
            ax1.invert_yaxis()
        else:
            correlation = self.df.corr()['Outcome'].drop('Outcome').sort_values()
            ax1.barh(range(len(correlation)), correlation.values, color='steelblue')
            ax1.set_yticks(range(len(correlation)))
            ax1.set_yticklabels(correlation.index)
            ax1.set_xlabel('Correlation with Outcome')
            ax1.set_title('Feature Correlation with Diabetes')
            ax1.invert_yaxis()
        
        # 2. Confusion Matrix Heatmap
        ax2 = axes[0, 1]
        y_pred = self.best_model.predict(self.X_test)
        cm = confusion_matrix(self.y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax2, 
                    xticklabels=['No Diabetes', 'Diabetes'],
                    yticklabels=['No Diabetes', 'Diabetes'])
        ax2.set_ylabel('Actual')
        ax2.set_xlabel('Predicted')
        ax2.set_title('Confusion Matrix')
        
        # 3. Class Distribution
        ax3 = axes[1, 0]
        outcome_counts = self.df['Outcome'].value_counts()
        colors = ['#90EE90', '#FFB6C6']
        ax3.pie(outcome_counts.values, labels=['No Diabetes', 'Diabetes'], 
                autopct='%1.1f%%', colors=colors, startangle=90)
        ax3.set_title('Dataset Class Distribution')
        
        # 4. ROC Curve
        ax4 = axes[1, 1]
        if hasattr(self.best_model, 'predict_proba'):
            y_pred_proba = self.best_model.predict_proba(self.X_test)[:, 1]
            fpr, tpr, _ = roc_curve(self.y_test, y_pred_proba)
            roc_auc = roc_auc_score(self.y_test, y_pred_proba)
            
            ax4.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
            ax4.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random Classifier')
            ax4.set_xlim([0.0, 1.0])
            ax4.set_ylim([0.0, 1.05])
            ax4.set_xlabel('False Positive Rate')
            ax4.set_ylabel('True Positive Rate')
            ax4.set_title('ROC Curve')
            ax4.legend(loc="lower right")
            ax4.grid(alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('model_performance.png', dpi=300, bbox_inches='tight')
        print("\n✓ Visualization saved: model_performance.png")
        
        return self


def main():
    """Main training pipeline"""
    print("\n" + "="*70)
    print("  DIABETES PREDICTION MODEL - TRAINING PIPELINE")
    print("="*70)
    
    # Initialize and run the pipeline
    predictor = DiabetesPredictor('diabetes.csv')
    
    predictor.load_data() \
             .preprocess_data() \
             .train_models() \
             .save_model() \
             .visualize_results()
    
    print("\n" + "="*70)
    print("  ✅ TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\n📦 Generated Files:")
    print("  • diabetes_model.pkl      - Trained ML model")
    print("  • scaler.pkl              - Feature scaler")
    print("  • feature_names.pkl       - Feature names")
    print("  • model_metadata.pkl      - Model information")
    print("  • model_performance.png   - Performance visualizations")
    print("\n🚀 Next: Run 'python app.py' to start the prediction API")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
