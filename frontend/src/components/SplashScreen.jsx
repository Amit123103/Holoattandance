import React, { useEffect, useState } from 'react';
import HackingInterface from './HackingInterface';
import BiometricScanner from './BiometricScanner';

const SplashScreen = ({ onComplete }) => {
    const [stage, setStage] = useState(1); // 1: Hacking, 2: Biometric

    useEffect(() => {
        // Stage 1: Hacking Interface for 1 second
        const timer1 = setTimeout(() => {
            setStage(2);
        }, 1000);

        // Stage 2: Biometric Scanner for 4 seconds (Total 5 seconds)
        const timer2 = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black">
            {stage === 1 && <HackingInterface />}
            {stage === 2 && <BiometricScanner />}
        </div>
    );
};

export default SplashScreen;
