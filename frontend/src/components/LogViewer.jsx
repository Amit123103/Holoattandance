import { useState, useEffect, useRef } from 'react';
import { FaTerminal, FaRedo, FaDownload } from 'react-icons/fa';
import api from '../api/axiosConfig';

export default function LogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const logsEndRef = useRef(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/logs?lines=200');
            setLogs(response.data.logs || []);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => {
            if (autoRefresh) {
                fetchLogs();
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh]);

    useEffect(() => {
        // Scroll to bottom when logs update
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([logs.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `server_logs_${new Date().toISOString()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="glass-card p-0 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2 text-cyan-400">
                    <FaTerminal />
                    <h3 className="font-mono font-bold">System Logs (backend.log)</h3>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`text-xs px-2 py-1 rounded border ${autoRefresh ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/20 text-white/50'}`}
                    >
                        {autoRefresh ? 'Live' : 'Paused'}
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="text-white/70 hover:text-white"
                        title="Refresh Now"
                    >
                        <FaRedo className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="text-white/70 hover:text-white"
                        title="Download Logs"
                    >
                        <FaDownload />
                    </button>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/40 text-gray-300 space-y-1">
                {logs.length === 0 ? (
                    <div className="text-white/30 italic text-center mt-10">No logs available or server not reachable.</div>
                ) : (
                    logs.map((log, index) => {
                        let colorClass = "text-gray-300";
                        if (log.includes("ERROR")) colorClass = "text-red-400";
                        else if (log.includes("WARNING")) colorClass = "text-yellow-400";
                        else if (log.includes("INFO")) colorClass = "text-blue-300";

                        return (
                            <div key={index} className={`break-all hover:bg-white/5 px-2 rounded ${colorClass}`}>
                                <span className="text-white/20 mr-2 opacity-50 select-none">{index + 1}</span>
                                {log}
                            </div>
                        );
                    })
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}
