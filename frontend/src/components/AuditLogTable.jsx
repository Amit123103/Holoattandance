import { useState, useEffect } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaUserCog, FaClock } from 'react-icons/fa';

export default function AuditLogTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/audit-logs`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionIcon = (type) => {
        if (type.includes('FAILED') || type.includes('ALERT')) return <FaExclamationTriangle className="text-red-400" />;
        if (type.includes('LOGIN')) return <FaUserCog className="text-blue-400" />;
        return <FaShieldAlt className="text-green-400" />;
    };

    const getActionColor = (type) => {
        if (type.includes('FAILED') || type.includes('ALERT')) return 'text-red-400';
        if (type.includes('LOGIN')) return 'text-blue-400';
        return 'text-white';
    };

    if (loading) return <div className="text-center text-cyan-400 py-8">Loading Security Logs...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP / Details</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FaClock /> {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    {getActionIcon(log.action_type)}
                                    <span className={`text-sm font-medium ${getActionColor(log.action_type)}`}>
                                        {log.action_type}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {log.actor_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                {log.resource}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                <div>{log.ip_address}</div>
                                <div className="truncate max-w-xs" title={JSON.stringify(log.details)}>
                                    {JSON.stringify(log.details)}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                No security events recorded yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
