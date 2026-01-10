import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login, signup, loading } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
            result = await signup(formData.name, formData.email, formData.password);
        }

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="auth-info">
                    <p>💾 Login to save your prediction history</p>
                    <p>Or continue as guest (predictions won't be saved)</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-alert">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    {isLogin ? 'Logging in...' : 'Signing up...'}
                                </>
                            ) : (
                                <>
                                    <span>🔐</span>
                                    {isLogin ? 'Login' : 'Sign Up'}
                                </>
                            )}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            <span>🚶</span>
                            Continue as Guest
                        </button>
                    </div>
                </form>

                <div className="auth-toggle">
                    {isLogin ? (
                        <p>
                            Don't have an account?{' '}
                            <button onClick={() => setIsLogin(false)}>Sign up</button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button onClick={() => setIsLogin(true)}>Login</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
