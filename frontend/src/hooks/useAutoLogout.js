import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useAutoLogout = () => {
    const navigate = useNavigate();
    const logoutTimer = useRef(null);

    const logoutUser = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('refreshToken');
        navigate('/admin/login');
        alert("You have been logged out due to inactivity.");
    };

    const resetTimer = () => {
        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
        }
        logoutTimer.current = setTimeout(logoutUser, AUTO_LOGOUT_TIME);
    };

    useEffect(() => {
        const events = [
            'load',
            'mousemove',
            'mousedown',
            'click',
            'scroll',
            'keypress'
        ];

        // Check if user is logged in
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        resetTimer();

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (logoutTimer.current) {
                clearTimeout(logoutTimer.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [navigate]); // Re-run if navigation changes, but mostly stable
};
