import { useLive } from '../context/LiveContext';
import { FaBolt, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

export default function LiveActivityFeed() {
    const { events, isConnected } = useLive();

    const getIcon = (type, severity) => {
        if (severity === 'warning' || severity === 'critical') return <FaExclamationTriangle className="text-yellow-500" />;
        if (type === 'attendance_update') return <FaCheckCircle className="text-green-400" />;
        return <FaInfoCircle className="text-cyan-400" />;
    };

    return (
        <div className="glass-card p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <FaBolt className={isConnected ? "text-green-400 animate-pulse" : "text-red-500"} />
                    Live Activity
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {events.length === 0 ? (
                    <p className="text-gray-500 text-center text-sm py-8">Waiting for events...</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="bg-white/5 p-3 rounded-lg border-l-2 border-cyan-500/50 hover:bg-white/10 transition-colors animate-fade-in-up">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {getIcon(event.type, event.payload.severity)}
                                </div>
                                <div>
                                    {event.type === 'attendance_update' && (
                                        <>
                                            <p className="text-sm font-semibold text-white">
                                                {event.payload.student_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Verified at {event.payload.time}
                                            </p>
                                        </>
                                    )}
                                    {event.type === 'audit_log' && (
                                        <>
                                            <p className="text-sm font-semibold text-white">
                                                {event.payload.event_type.replace('_', ' ').toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {event.payload.description}
                                            </p>
                                        </>
                                    )}
                                    {!['attendance_update', 'audit_log'].includes(event.type) && (
                                        <p className="text-sm text-gray-300">New system event received</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
