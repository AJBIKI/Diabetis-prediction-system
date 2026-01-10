import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
    const { token, user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0, diabetes: 0, noDiabetes: 0 });

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/history?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch history');

            const data = await response.json();
            setHistory(data.predictions);

            // Calculate simple stats
            const total = data.predictions.length;
            const diabetes = data.predictions.filter(p => p.prediction === 1).length;
            setStats({
                total,
                diabetes,
                noDiabetes: total - diabetes
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (history.length === 0) return (
        <div className="empty-state">
            <h3>No predictions yet!</h3>
            <p>Make your first prediction to see it here.</p>
        </div>
    );

    // Prepare chart data
    const pieData = [
        { name: 'Diabetes', value: stats.diabetes },
        { name: 'No Diabetes', value: stats.noDiabetes },
    ];

    const COLORS = ['#ef4444', '#10b981'];

    const lineData = history.slice().reverse().map(p => ({
        date: format(new Date(p.createdAt), 'MM/dd'),
        glucose: p.input.Glucose,
        bmi: p.input.BMI,
        result: p.prediction
    }));

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>👋 Welcome back, {user?.name}</h2>
                <p>Here's your health prediction outcome overview</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Scans</h3>
                    <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-card negative">
                    <h3>Diabetes Risk</h3>
                    <p className="stat-value">{stats.diabetes}</p>
                </div>
                <div className="stat-card positive">
                    <h3>No Risk</h3>
                    <p className="stat-value">{stats.noDiabetes}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-card">
                    <h3>Glucose Level Trend</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="glucose" stroke="#60a5fa" name="Glucose" />
                                <Line type="monotone" dataKey="bmi" stroke="#a78bfa" name="BMI" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Risk Distribution</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="history-table-container">
                <h3>Recent History</h3>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Glucose</th>
                            <th>BMI</th>
                            <th>Age</th>
                            <th>Result</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((record) => (
                            <tr key={record._id}>
                                <td>{format(new Date(record.createdAt), 'MMM dd, yyyy')}</td>
                                <td>{record.input.Glucose}</td>
                                <td>{record.input.BMI}</td>
                                <td>{record.input.Age}</td>
                                <td>
                                    <span className={`status-badge ${record.prediction === 1 ? 'danger' : 'success'}`}>
                                        {record.prediction === 1 ? 'Diabetes' : 'No Diabetes'}
                                    </span>
                                </td>
                                <td>{record.confidence ? `${(record.confidence * 100).toFixed(0)}%` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
