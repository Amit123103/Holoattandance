import React, { useEffect, useState } from 'react';

const BiometricScanner = () => {
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 30); // 30ms * 100 = 3000ms (~3s)
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-cyan-400 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Scanner Circle */}
                <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-4 border-cyan-900 rounded-full animate-spin-slow-reverse opacity-50"></div>
                    <div className="absolute inset-4 border-2 border-cyan-500 rounded-full border-dashed animate-spin-slow"></div>
                    <div className="absolute inset-12 border border-blue-500 rounded-full animate-pulse"></div>

                    {/* Central Iris */}
                    <div className="w-32 h-32 bg-cyan-900/20 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>

                    {/* Scanning Line */}
                    <div className="absolute w-full h-1 bg-cyan-400 opacity-50 animate-scan-vertical shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
                </div>

                {/* Text and Progress */}
                <div className="mt-8 text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-widest uppercase">
                        {scanProgress < 100 ? 'Authenticating...' : 'Access Granted'}
                    </h2>
                    <div className="text-sm opacity-70">
                        Biometric Data Analysis: {Math.floor(scanProgress)}%
                    </div>
                    {/* Status Bar */}
                    <div className="w-64 h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-900/50">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-100"
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-slow-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes scan-vertical {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-spin-slow { animation: spin-slow 10s linear infinite; }
                .animate-spin-slow-reverse { animation: spin-slow-reverse 15s linear infinite; }
                .animate-scan-vertical { animation: scan-vertical 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default BiometricScanner;
