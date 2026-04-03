import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader/Loader';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    console.log('[PRIVATE ROUTE] Auth State - User:', !!user, 'Loading:', loading, 'Has Token:', !!token);

    // If still checking initial auth from localStorage
    if (loading) return <Loader />;

    // If we have a token but user state hasn't updated yet, wait before redirecting
    // This prevents the "flash" of login screen and immediate redirect back
    if (!user && token) {
        console.log('[PRIVATE ROUTE] Token found but user state null. Waiting...');
        return <Loader />;
    }

    if (!user) {
        console.warn('[PRIVATE ROUTE] No user found. Checking localStorage token:', !!token);
        if (token) {
            console.log('[PRIVATE ROUTE] Found token but user state empty. This might be a transient state or invalid token.');
        } else {
            console.warn('[PRIVATE ROUTE] No token, no user. Redirecting to login!');
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
