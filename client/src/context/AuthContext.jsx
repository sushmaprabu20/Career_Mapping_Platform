import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[API] Initializing with baseURL:', import.meta.env.VITE_API_BASE_URL || '/api');
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (err) {
                console.error('Error parsing userInfo from localStorage', err);
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('[AUTH] Attempting login for:', email);
            const { data } = await api.post('/auth/login', { email, password });
            
            if (!data || !data.token) {
                console.error('[AUTH] Login response missing token:', data);
                throw new Error('Invalid server response: No authentication token received.');
            }

            console.log('[AUTH] Login Success:', data);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            console.error('[AUTH] Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            console.log('[AUTH] Attempting registration for:', email);
            const { data } = await api.post('/auth/register', { name, email, password });

            console.log('[AUTH] Registration Response:', data);

            if (!data || typeof data !== 'object') {
                 console.error('[AUTH] Registration response is not an object. Possibly hitting HTML fallback:', data);
                 throw new Error('Invalid server response: Expected JSON, received something else.');
            }

            if (!data.token) {
                console.error('[AUTH] Registration response missing token:', data);
                throw new Error('Invalid server response: No authentication token received.');
            }

            console.log('[AUTH] Registration Success:', data);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            console.error('[AUTH] Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
