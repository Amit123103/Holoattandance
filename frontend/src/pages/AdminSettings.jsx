import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaPalette, FaSlidersH, FaVideo, FaServer, FaTerminal, FaSave, FaCog, FaGlobe } from 'react-icons/fa';
import Tooltip from '../components/Tooltip';
import LogViewer from '../components/LogViewer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../api/axiosConfig';

export default function AdminSettings() {
    const { theme, setTheme, glassOpacity, setGlassOpacity, reduceMotion, setReduceMotion, themes } = useTheme();
    const [activeTab, setActiveTab] = useState('visual');
    const [configs, setConfigs] = useState({});
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (activeTab === 'system') {
            fetchConfigs();
        }
    }, [activeTab]);

    const fetchConfigs = async () => {
        setLoadingConfig(true);
        try {
            const response = await api.get('/api/admin/config');
            setConfigs(response.data);
        } catch (error) {
            console.error("Failed to fetch configs:", error);
        } finally {
            setLoadingConfig(false);
        }
    };

    const handleConfigChange = async (key, newValue) => {
        // Optimistic update
        setConfigs(prev => ({
            ...prev,
            [key]: { ...prev[key], value: newValue }
        }));

        try {
            await api.put('/api/admin/config', { key, value: newValue });
            setSaveStatus(`Saved ${key}`);
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            console.error("Failed to update config:", error);
            setSaveStatus('Error saving');
            fetchConfigs(); // Revert on error
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: FaGlobe },
        { id: 'visual', label: 'Visual Customization', icon: FaPalette },
        { id: 'system', label: 'System Configuration', icon: FaCog },
        { id: 'logs', label: 'Server Logs', icon: FaTerminal },
    ];

    return (
        <div className="space-y-6 animate-fade-in min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-6">Settings & Maintenance</h1>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-white/10 mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        id={`${tab.id}-tab`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors relative whitespace-nowrap
                            ${activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80'}
                        `}
                    >
                        <tab.icon />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Config Save Toast */}
            {saveStatus && (
                <div className="fixed bottom-6 right-6 px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-lg animate-fade-in">
                    {saveStatus}
                </div>
            )}

            {/* --- GENERAL TAB --- */}
            {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)]">
                        <FaGlobe /> General Settings
                    </h2>
                    <div className="glass-card p-6" id="language-selector">
                        <h3 className="text-lg font-semibold mb-4">Language</h3>
                        <LanguageSwitcher />
                    </div>
                </div>
            )}

            {/* --- VISUAL TAB --- */}
            {activeTab === 'visual' && (
                <div className="space-y-8 animate-fade-in">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)]">
                        <FaPalette /> Analysis & Theme
                    </h2>

                    {/* Theme Selector */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Holo Accent Color</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.keys(themes).map((colorKey) => (
                                <button
                                    key={colorKey}
                                    onClick={() => setTheme(colorKey)}
                                    className={`relative h-24 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden
                                        ${theme === colorKey ? 'border-white scale-105 shadow-xl' : 'border-transparent opacity-70 hover:opacity-100'}
                                    `}
                                    style={{
                                        background: `linear-gradient(135deg, ${themes[colorKey].primary}20, ${themes[colorKey].secondary}40)`
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full shadow-lg"
                                        style={{ background: themes[colorKey].primary }}
                                    ></div>
                                    <span className="capitalize font-medium text-sm">{colorKey}</span>

                                    {theme === colorKey && (
                                        <div className="absolute inset-0 border-4 border-[var(--color-primary)] rounded-xl opacity-50"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interface Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Glass Intensity */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FaVideo /> Glass Intensity
                                <Tooltip text="Controls the blur and transparency of all UI panels. Lower values are more transparent." />
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Clear</span>
                                    <span>Frosted</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="0.3"
                                    step="0.01"
                                    value={glassOpacity}
                                    onChange={(e) => setGlassOpacity(e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                                <p className="text-xs text-center text-gray-500">
                                    Adjusts the background opacity (Current: {Math.round(glassOpacity * 100)}%)
                                </p>
                            </div>
                        </div>

                        {/* Motion Controls */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FaSlidersH /> Accessibility
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Reduce Motion</p>
                                    <p className="text-xs text-gray-400">Disable heavy animations</p>
                                </div>
                                <button
                                    onClick={() => setReduceMotion(!reduceMotion)}
                                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${reduceMotion ? 'bg-[var(--color-primary)]' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${reduceMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SYSTEM TAB --- */}
            {activeTab === 'system' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)]">
                        <FaServer /> System Configuration
                    </h2>

                    {loadingConfig ? (
                        <div className="p-10 text-center text-white/50">Loading configurations...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(configs).map(([key, config]) => (
                                <div key={key} className="glass-card p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{key.replace(/_/g, ' ')}</h3>
                                            <p className="text-sm text-white/50">{config.description}</p>
                                        </div>
                                    </div>

                                    {key.includes('ENABLED') || key.includes('MODE') ? (
                                        // Boolean Toggle
                                        <button
                                            onClick={() => handleConfigChange(key, config.value === 'true' ? 'false' : 'true')}
                                            className={`w-full py-3 rounded-lg font-bold transition-all ${config.value === 'true'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                }`}
                                        >
                                            {config.value === 'true' ? 'ENABLED' : 'DISABLED'}
                                        </button>
                                    ) : (
                                        // Input Field (Number/Text)
                                        <div className="flex gap-2">
                                            <input
                                                type={key.includes('SCORE') || key.includes('THRESHOLD') ? "number" : "text"}
                                                step="0.05"
                                                min="0"
                                                max="1"
                                                value={config.value}
                                                onChange={(e) => handleConfigChange(key, e.target.value)}
                                                className="input-field w-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- LOGS TAB --- */}
            {activeTab === 'logs' && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)] mb-4">
                        <FaTerminal /> Server Logs
                    </h2>
                    <LogViewer />
                </div>
            )}
        </div>
    );
}
