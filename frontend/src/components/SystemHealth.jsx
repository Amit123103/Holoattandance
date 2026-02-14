import { useState, useEffect } from 'react';
import { FaServer, FaMemory, FaHdd, FaClock, FaDownload, FaSync } from 'react-icons/fa';

export default function SystemHealth() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/system/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error("Stats error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // 5s poll
        return () => clearInterval(interval);
    }, []);

    const handleBackup = () => {
        const token = localStorage.getItem('token');
        window.open(`${import.meta.env.VITE_API_URL}/api/admin/system/backup?token=${token}`, '_blank');
    };

    if (loading) return <div className="text-center text-cyan-400 p-8">Loading System Telemetry...</div>;
    if (!stats) return <div className="text-center text-red-400 p-8">System Offline</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CPU */}
                <div className="glass-card p-4 border-l-4 border-cyan-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">CPU Usage</p>
                            <h3 className="text-2xl font-bold text-white">{stats.cpu_usage}%</h3>
                        </div>
                        <FaServer className="text-cyan-500 text-xl" />
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${stats.cpu_usage > 80 ? 'bg-red-500' : 'bg-cyan-500'} transition-all duration-500`}
                            style={{ width: `${stats.cpu_usage}%` }}
                        ></div>
                    </div>
                </div>

                {/* RAM */}
                <div className="glass-card p-4 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">Memory</p>
                            <h3 className="text-2xl font-bold text-white">{stats.ram_usage}%</h3>
                        </div>
                        <FaMemory className="text-purple-500 text-xl" />
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                        <div
                            className={`h-full ${stats.ram_usage > 85 ? 'bg-red-500' : 'bg-purple-500'} transition-all duration-500`}
                            style={{ width: `${stats.ram_usage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400">{stats.ram_details}</p>
                </div>

                {/* Disk */}
                <div className="glass-card p-4 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">Storage</p>
                            <h3 className="text-2xl font-bold text-white">{stats.disk_usage}%</h3>
                        </div>
                        <FaHdd className="text-green-500 text-xl" />
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                        <div
                            className={`h-full ${stats.disk_usage > 90 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-500`}
                            style={{ width: `${stats.disk_usage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400">{stats.disk_details}</p>
                </div>

                {/* Uptime */}
                <div className="glass-card p-4 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">System Uptime</p>
                            <h3 className="text-lg font-bold text-white truncate">{stats.uptime}</h3>
                        </div>
                        <FaClock className="text-yellow-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-400">Server Time: {stats.server_time.split(' ')[1]}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Disaster Recovery</h3>
                    <p className="text-sm text-gray-400">Export a complete snapshot of the database.</p>
                </div>
                <button
                    onClick={handleBackup}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                    <FaDownload /> Download Backup (JSON)
                </button>
            </div>
        </div>
    );
}
