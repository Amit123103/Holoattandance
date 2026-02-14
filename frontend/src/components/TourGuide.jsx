import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { FaQuestionCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardSteps, getSettingsSteps, createDriver } from '../utils/tourSteps';

export default function TourGuide() {
    const location = useLocation();
    const { t } = useTranslation();

    const startTour = () => {
        const driverObj = createDriver();
        let steps = [];

        if (location.pathname === '/admin/dashboard') {
            steps = getDashboardSteps(t);
        } else if (location.pathname === '/admin/settings') {
            steps = getSettingsSteps(t);
        } else {
            alert("No tour available for this page yet.");
            return;
        }

        driverObj.setSteps(steps);
        driverObj.drive();
    };

    // Auto-start tour on first visit to dashboard (example logic)
    useEffect(() => {
        const hasSeenDashboardTour = localStorage.getItem('hasSeenDashboardTour');
        if (location.pathname === '/admin/dashboard' && !hasSeenDashboardTour) {
            // setTimeout(() => startTour(), 1000); // Optional: Auto-start
            // localStorage.setItem('hasSeenDashboardTour', 'true');
        }
    }, [location.pathname]);

    // Only show Help button on admin pages
    if (!location.pathname.startsWith('/admin')) return null;

    return (
        <button
            onClick={startTour}
            className="fixed bottom-6 right-20 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all animate-bounce-slow"
            title="Start Tour"
        >
            <FaQuestionCircle size={24} />
        </button>
    );
}
