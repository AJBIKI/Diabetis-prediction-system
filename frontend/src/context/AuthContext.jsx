import { createContext, useState, useEffect, useContext } from 'react';
import API_URL from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Signup failed' };
            }
        } catch (error) {
            return { success: false, error: 'Connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
