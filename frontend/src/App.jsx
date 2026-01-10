import { useState } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import ResultDisplay from './components/ResultDisplay';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [view, setView] = useState('predict'); // 'predict' or 'dashboard'
  const { user, logout, token } = useAuth();

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Include auth token if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      import API_URL from './config';

      const handlePredict = async (features) => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_URL}/api/predict`, {
            method: 'POST',
            headers,
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Prediction failed');
          }

          setResult(data);
        } catch (err) {
          setError(err.message || 'Failed to connect to server');
        } finally {
          setLoading(false);
        }
      };

      const handleReset = () => {
        setResult(null);
        setError(null);
      };

      return (
        <div className="app">
          <div className="container">
            <header className="header">
              <div className="header-top">
                {user ? (
                  <div className="user-profile">
                    <span className="user-name">👤 {user.name}</span>
                    <button className="logout-btn" onClick={logout}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <button className="login-btn" onClick={() => setShowAuthModal(true)}>
                    🔐 Login / Sign Up
                  </button>
                )}
              </div>

              <div className="icon">🏥</div>
              <h1>Diabetes Prediction System</h1>
              <p className="subtitle">AI-Powered Health Risk Assessment</p>

              {user && (
                <div className="nav-toggle">
                  <button
                    className={`nav-btn ${view === 'predict' ? 'active' : ''}`}
                    onClick={() => setView('predict')}
                  >
                    🩺 New Prediction
                  </button>
                  <button
                    className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setView('dashboard')}
                  >
                    📊 Dashboard
                  </button>
                </div>
              )}

              {!user && (
                <div className="guest-notice">
                  <p>💡 <strong>Guest mode:</strong> Predictions won't be saved. <button className="link-btn" onClick={() => setShowAuthModal(true)}>Login to save history</button></p>
                </div>
              )}
            </header>

            <div className="content">
              {view === 'dashboard' && user ? (
                <Dashboard />
              ) : !result ? (
                <PredictionForm
                  onSubmit={handlePredict}
                  loading={loading}
                  error={error}
                />
              ) : (
                <ResultDisplay result={result} onReset={handleReset} />
              )}
            </div>

            <footer className="footer">
              <p>
                Powered by Machine Learning • For Educational Purposes Only
              </p>
            </footer>
          </div>

          {showAuthModal && (
            <AuthModal onClose={() => setShowAuthModal(false)} />
          )}
        </div>
      );
    }

export default App;
