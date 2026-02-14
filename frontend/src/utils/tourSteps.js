import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const getDashboardSteps = (t) => [
    {
        element: '#dashboard-title',
        popover: {
            title: t('dashboard'),
            description: 'This is your command center. View student stats and live attendance here.',
            side: "bottom",
            align: 'start'
        }
    },
    {
        element: '#live-feed-panel',
        popover: {
            title: 'Live Activity',
            description: 'Real-time logs of student check-ins appear here instantly.',
            side: "left",
            align: 'start'
        }
    },
    {
        element: '#csv-upload-btn',
        popover: {
            title: 'Bulk Import',
            description: 'Upload a CSV file to register multiple students at once.',
            side: "bottom",
            align: 'start'
        }
    },
    {
        element: '#analytics-btn',
        popover: {
            title: t('analytics'),
            description: 'Click here to view detailed charts and attendance trends.',
            side: "bottom",
            align: 'start'
        }
    }
];

export const getSettingsSteps = (t) => [
    {
        element: '#general-tab',
        popover: {
            title: 'General Settings',
            description: 'Configure global system settings here.',
            side: "bottom"
        }
    },
    {
        element: '#language-selector',
        popover: {
            title: t('language'),
            description: 'Switch between English, Spanish, and French instantly.',
            side: "top"
        }
    },
    {
        element: '#visual-tab',
        popover: {
            title: 'Visual Customization',
            description: 'Personalize the Look & Feel. Try the "Glass" or "Neon" themes!',
            side: "bottom"
        }
    }
];

export const createDriver = () => {
    return driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'Done',
        closeBtnText: 'Close',
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
    });
};
