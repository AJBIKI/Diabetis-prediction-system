import { useState } from 'react';

const PredictionForm = ({ onSubmit, loading, error }) => {
    const [formData, setFormData] = useState({
        Pregnancies: '',
        Glucose: '',
        BloodPressure: '',
        SkinThickness: '',
        Insulin: '',
        BMI: '',
        DiabetesPedigreeFunction: '',
        Age: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert all values to numbers
        const data = {};
        for (const key in formData) {
            data[key] = parseFloat(formData[key]);
        }

        onSubmit(data);
    };

    const fields = [
        {
            name: 'Pregnancies',
            label: '🤰 Pregnancies',
            placeholder: 'e.g., 6',
            helper: 'Number of times pregnant',
        },
        {
            name: 'Glucose',
            label: '🩸 Glucose',
            placeholder: 'e.g., 148',
            helper: 'Plasma glucose (mg/dL)',
        },
        {
            name: 'BloodPressure',
            label: '💓 Blood Pressure',
            placeholder: 'e.g., 72',
            helper: 'Diastolic BP (mm Hg)',
        },
        {
            name: 'SkinThickness',
            label: '📏 Skin Thickness',
            placeholder: 'e.g., 35',
            helper: 'Triceps skinfold (mm)',
        },
        {
            name: 'Insulin',
            label: '💉 Insulin',
            placeholder: 'e.g., 0',
            helper: '2-Hour serum insulin (mu U/ml)',
        },
        {
            name: 'BMI',
            label: '⚖️ BMI',
            placeholder: 'e.g., 33.6',
            helper: 'Body Mass Index',
        },
        {
            name: 'DiabetesPedigreeFunction',
            label: '🧬 Pedigree Function',
            placeholder: 'e.g., 0.627',
            helper: 'Diabetes genetic factor',
        },
        {
            name: 'Age',
            label: '🎂 Age',
            placeholder: 'e.g., 50',
            helper: 'Age in years',
        },
    ];

    return (
        <form className="form" onSubmit={handleSubmit}>
            {error && (
                <div className="error-alert">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="form-grid">
                {fields.map((field) => (
                    <div key={field.name} className="form-group">
                        <label htmlFor={field.name}>{field.label}</label>
                        <input
                            type="number"
                            id={field.name}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required
                            step="any"
                            min="0"
                        />
                        <span className="helper-text">{field.helper}</span>
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <span>🔍</span>
                            Get Prediction
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default PredictionForm;
