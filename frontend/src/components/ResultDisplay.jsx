const ResultDisplay = ({ result, onReset }) => {
    const isDiabetes = result.prediction === 1;
    const probability = result.probability;

    return (
        <div className="result-container">
            <div className={`result-card ${isDiabetes ? 'result-positive' : 'result-negative'}`}>
                <div className="result-icon">{isDiabetes ? '⚠️' : '✅'}</div>
                <h2 className="result-title">{result.result}</h2>
                <p className="result-message">
                    {isDiabetes
                        ? 'Based on the input data, there is an indication of diabetes risk.'
                        : 'Based on the input data, no diabetes risk detected.'}
                </p>

                {probability && (
                    <div className="probability-section">
                        <h3>Prediction Confidence</h3>
                        <div className="probability-bars">
                            <div className="probability-bar">
                                <div className="probability-header">
                                    <span>No Diabetes</span>
                                    <span>{(probability.no_diabetes * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bar-container">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${probability.no_diabetes * 100}%`,
                                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="probability-bar">
                                <div className="probability-header">
                                    <span>Diabetes</span>
                                    <span>{(probability.diabetes * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bar-container">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${probability.diabetes * 100}%`,
                                            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="input-details">
                <h3>Input Parameters</h3>
                <div className="input-grid">
                    {Object.entries(result.input_features).map(([key, value]) => (
                        <div key={key} className="input-item">
                            <span className="input-label">{key}</span>
                            <span className="input-value">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="input-details">
                <h3>Model Information</h3>
                <div className="input-item">
                    <span className="input-label">Algorithm Used</span>
                    <span className="input-value">{result.model_algorithm}</span>
                </div>
                {result.confidence && (
                    <div className="input-item">
                        <span className="input-label">Overall Confidence</span>
                        <span className="input-value">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div className="button-group">
                <button onClick={onReset} className="btn btn-secondary">
                    <span>🔄</span>
                    New Prediction
                </button>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <p style={{ fontSize: '0.9rem', color: '#fbbf24' }}>
                    ⚠️ <strong>Disclaimer:</strong> This is a machine learning model for educational purposes only.
                    Always consult with healthcare professionals for medical advice.
                </p>
            </div>
        </div>
    );
};

export default ResultDisplay;
