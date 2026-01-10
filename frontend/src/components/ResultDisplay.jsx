import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ResultDisplay = ({ result, onReset }) => {
    const isDiabetes = result.prediction === 1;
    const probability = result.probability;
    // Get diabetes probability (0-100)
    const riskValue = probability ? probability.diabetes * 100 : 0;

    // Gauge data: [Risky Part, Safe Part] relative to total 100
    const gaugeData = [
        { name: 'Risk', value: riskValue },
        { name: 'Remaining', value: 100 - riskValue }
    ];

    // AI Advice Generator (Simulating Gemini API)
    const getAIAdvice = () => {
        const tips = [];
        const { Glucose, BMI, Age, BloodPressure } = result.input_features;

        if (Glucose > 140) tips.push("📉 **Glucose Management**: Your glucose is high. Consider reducing refined carbs and sugars.");
        if (BMI > 30) tips.push("⚖️ **Weight Goal**: Your BMI indicates obesity. Aim for 30 mins of daily walking.");
        else if (BMI > 25) tips.push("⚖️ **Weight Watch**: You are slightly overweight. Monitor your calorie intake.");
        if (BloodPressure > 80) tips.push("❤️ **Heart Health**: Blood pressure is elevated. Reduce sodium intake.");
        if (Age > 50) tips.push("📅 **Screening**: At your age, regular eye and kidney screenings are recommended.");

        if (tips.length === 0) tips.push("✅ **Great Job**: Your metrics look healthy! Keep up the balanced diet and exercise.");

        return tips;
    };

    const advice = getAIAdvice();

    const generatePDF = async () => {
        const element = document.querySelector('.result-container');
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#0f172a',
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`diabetes-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="result-container">
            <div className={`result-card ${isDiabetes ? 'result-positive' : 'result-negative'}`}>

                {/* Visual Gauge using Recharts */}
                <div style={{ width: '100%', height: '200px', position: 'relative', margin: '0 auto' }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={gaugeData}
                                cx="50%"
                                cy="70%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={riskValue > 50 ? "#ef4444" : "#10b981"} />
                                <Cell fill="#334155" /> {/* Background track */}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                        position: 'absolute',
                        top: '65%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                            {riskValue.toFixed(1)}%
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Risk Score</div>
                    </div>
                </div>

                <div className="result-icon">{isDiabetes ? '⚠️' : '✅'}</div>
                <h2 className="result-title">{result.result}</h2>
                <p className="result-message">
                    {isDiabetes
                        ? 'Based on the input data, there is an indication of diabetes risk.'
                        : 'Based on the input data, no diabetes risk detected.'}
                </p>

                {/* AI Advice Section */}
                <div style={{ marginTop: '1.5rem', background: 'rgba(79, 70, 229, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.3)', textAlign: 'left' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#a78bfa' }}>
                        🧠 AI Health Assistant
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {advice.map((tip, index) => (
                            <li key={index} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </li>
                        ))}
                    </ul>
                </div>

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
                <button onClick={generatePDF} className="btn btn-primary">
                    <span>📄</span>
                    Download Report
                </button>
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
