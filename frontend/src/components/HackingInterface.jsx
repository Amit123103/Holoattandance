import React, { useEffect, useState } from 'react';

const HackingInterface = () => {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLines(prev => {
                const newLine = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const newLines = [...prev, `> ${newLine.toUpperCase()}`];
                if (newLines.length > 20) newLines.shift();
                return newLines;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-green-500 font-mono overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

            <div className="z-10 text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-widest animate-pulse glitch-text">
                    SYSTEM INITIALIZATION
                </h1>
                <div className="h-1 w-64 bg-gray-800 rounded-full overflow-hidden mx-auto border border-green-900">
                    <div className="h-full bg-green-500 animate-progress-fast"></div>
                </div>
            </div>

            <div className="absolute top-0 left-0 p-4 text-xs md:text-sm opacity-70 w-full h-full pointer-events-none overflow-hidden">
                {lines.map((line, i) => (
                    <div key={i} className="truncate">{line}</div>
                ))}
            </div>

            <style>{`
                .glitch-text {
                    text-shadow: 2px 0 #0f0, -2px 0 #00f;
                }
                @keyframes progress-fast {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress-fast {
                    animation: progress-fast 1s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HackingInterface;
