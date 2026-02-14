import { useState } from 'react';
import { FaBook, FaShieldAlt, FaCamera, FaCogs, FaSearch } from 'react-icons/fa';

export default function HelpPage() {
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { id: 'intro', icon: <FaBook />, title: "Getting Started" },
        { id: 'biometrics', icon: <FaCamera />, title: "Biometrics & Liveness" },
        { id: 'admin', icon: <FaShieldAlt />, title: "Admin Controls" },
        { id: 'customization', icon: <FaCogs />, title: "Customization" },
    ];

    const content = {
        intro: (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2"><FaBook className="text-[var(--color-primary)]" /> Getting Started</h2>
                <p className="text-gray-300">Welcome to the <strong>Holo Biometric Attendance System</strong>. This platform uses state-of-the-art AI to secure your facility.</p>

                <h3 className="text-xl font-semibold mt-6 text-[var(--color-secondary)]">Key Shortcuts</h3>
                <div className="grid gap-3">
                    <div className="flex items-center justify-between glass p-3 rounded-lg">
                        <span>Open Command Palette</span>
                        <code className="bg-gray-800 px-2 py-1 rounded text-[var(--color-accent)] font-mono">Ctrl + K</code>
                    </div>
                </div>
            </div>
        ),
        biometrics: (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2"><FaCamera className="text-[var(--color-primary)]" /> Biometrics & Liveness</h2>
                <p className="text-gray-300">We use a dual-verification system combining <strong>Iris Analysis</strong> and <strong>Fingerprint Matching</strong>.</p>

                <h3 className="text-xl font-semibold mt-6 text-[var(--color-secondary)]">Anti-Spoofing Guidelines</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li><strong>Blink Challenge:</strong> You must blink naturally to prove you are not a photo.</li>
                    <li><strong>Head Pose:</strong> Follow voice commands ("Look Left") to verify 3D geometry.</li>
                    <li><strong>Lighting:</strong> Ensure the quality indicator is NOT red (Bad Lighting).</li>
                </ul>
            </div>
        ),
        admin: (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2"><FaShieldAlt className="text-[var(--color-primary)]" /> Admin Controls</h2>
                <p className="text-gray-300">The Admin Dashboard is your mission control center.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="glass-card p-4">
                        <h4 className="font-bold text-[var(--color-accent)]">Audit Logs</h4>
                        <p className="text-sm text-gray-400">Track every login, deletion, and security alert in real-time.</p>
                    </div>
                    <div className="glass-card p-4">
                        <h4 className="font-bold text-[var(--color-accent)]">Reports</h4>
                        <p className="text-sm text-gray-400">Export attendance data to PDF or Excel with one click.</p>
                    </div>
                    <div className="glass-card p-4">
                        <h4 className="font-bold text-[var(--color-accent)]">System Health</h4>
                        <p className="text-sm text-gray-400">Monitor CPU/RAM usage and perform full database backups.</p>
                    </div>
                </div>
            </div>
        ),
        customization: (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2"><FaCogs className="text-[var(--color-primary)]" /> Customization</h2>
                <p className="text-gray-300">Make Holo yours via <strong>Settings</strong>.</p>

                <ul className="space-y-3 mt-4">
                    <li className="flex gap-3">
                        <span className="text-[var(--color-primary)] font-bold">Themes:</span>
                        <span>Switch between Cyber Blue, Neon Green, Crimson Red, or Gold.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-[var(--color-primary)] font-bold">Glass:</span>
                        <span>Adjust opacity sliders to control the transparency of the UI.</span>
                    </li>
                </ul>
            </div>
        )
    };

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <h1 className="text-2xl font-bold mb-6 tracking-tight">Holo <span className="text-[var(--color-primary)]">Docs</span></h1>

                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeSection === section.id
                                ? 'bg-[var(--color-primary)] text-black font-bold shadow-lg shadow-[var(--color-primary)]/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {section.icon}
                        {section.title}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 glass-card p-8 min-h-[500px]">
                {content[activeSection]}
            </div>
        </div>
    );
}
