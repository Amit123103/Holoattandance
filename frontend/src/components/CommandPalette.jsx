import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaSignInAlt, FaUserPlus, FaChartLine, FaShieldAlt, FaServer, FaSignOutAlt, FaUser, FaBook } from 'react-icons/fa';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    // Toggle with Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (isOpen && e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Fetch students for search context (if admin)
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token');
            if (token) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                fetch(`${apiUrl}/api/admin/students`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => setStudents(data.students || []))
                    .catch(() => { }); // Silent fail if not admin
            }
        }
    }, [isOpen]);

    // Define Actions based on context
    const getActions = () => {
        const token = localStorage.getItem('token');
        const baseActions = [
            { name: 'Go Home', icon: <FaHome />, action: () => navigate('/') },
            { name: 'Register Student', icon: <FaUserPlus />, action: () => navigate('/register') },
            { name: 'Mark Attendance', icon: <FaSignInAlt />, action: () => navigate('/attendance') },
        ];

        if (token) {
            baseActions.push(
                { name: 'Admin Dashboard', icon: <FaChartLine />, action: () => navigate('/admin/dashboard') },
                { name: 'Analytics', icon: <FaChartLine />, action: () => navigate('/admin/analytics') }, // Ideally specific tab
                { name: 'System Health', icon: <FaServer />, action: () => navigate('/admin/dashboard') }, // Todo: set active tab
                {
                    name: 'Logout', icon: <FaSignOutAlt />, action: () => {
                        localStorage.removeItem('token');
                        navigate('/admin/login');
                    }
                }
            );
        } else {
            baseActions.push(
                { name: 'Admin Login', icon: <FaShieldAlt />, action: () => navigate('/admin/login') }
            );
        }

        // Search Students
        let studentActions = [];
        if (query.length > 1) {
            studentActions = students
                .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.registration_number.includes(query))
                .slice(0, 5) // Limit results
                .map(s => ({
                    name: `Student: ${s.name} (${s.registration_number})`,
                    icon: <FaUser />,
                    action: () => {
                        // Navigate to dashboard and maybe highlight (complex), for now just go to dashboard
                        navigate('/admin/dashboard');
                    }
                }));
        }

        // Filter base actions
        const filteredBase = baseActions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

        return [...filteredBase, ...studentActions];
    };

    const filteredActions = getActions();

    // Keyboard Navigation
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredActions, selectedIndex]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm transition-all duration-200">
            <div className="w-full max-w-lg bg-gray-900/90 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden glass-card animate-fade-in-up">

                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-gray-700">
                    <FaSearch className="text-cyan-400 mr-3 text-lg" />
                    <input
                        className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 font-medium"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        autoFocus
                    />
                    <div className="flex gap-1">
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">ESC</span>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                    {filteredActions.length === 0 ? (
                        <div className="text-gray-500 text-center py-8 text-sm">No commands found.</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.action();
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-100 ${index === selectedIndex
                                        ? 'bg-cyan-500/20 text-cyan-50 border-l-2 border-cyan-400'
                                        : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`mr-3 text-lg ${index === selectedIndex ? 'text-cyan-400' : 'text-gray-500'}`}>
                                        {action.icon}
                                    </span>
                                    <span className="flex-1 font-medium">{action.name}</span>
                                    {index === selectedIndex && (
                                        <span className="text-xs bg-cyan-900/50 text-cyan-200 px-2 py-1 rounded">Enter</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex justify-between text-xs text-gray-600">
                    <span>Holo Commander v1.0</span>
                    <div className="flex gap-3">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
