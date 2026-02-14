import { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

export default function Tooltip({ text, children }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-flex items-center ml-2"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <FaInfoCircle className="text-[var(--color-primary)] opacity-70 hover:opacity-100 cursor-help transition-opacity" />

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900/95 border border-[var(--color-primary)] text-xs text-gray-300 p-3 rounded-lg shadow-xl z-50 animate-fade-in backdrop-blur-md">
                    {text}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--color-primary)]"></div>
                </div>
            )}
        </div>
    );
}
