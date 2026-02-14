import { createContext, useContext, useState, useEffect } from 'react';

const LiveContext = createContext();

export const useLive = () => useContext(LiveContext);

export const LiveProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [latestEvent, setLatestEvent] = useState(null);

    useEffect(() => {
        let eventSource;

        const connect = () => {
            console.log("Connecting to SSE...");
            eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/stream`);

            eventSource.onopen = () => {
                console.log("SSE Connected");
                setIsConnected(true);
            };

            eventSource.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    const newEvent = {
                        id: Date.now(),
                        type: data.type, // 'attendance_update', 'audit_log', 'system_health'
                        payload: data.payload,
                        timestamp: new Date()
                    };

                    setLatestEvent(newEvent);
                    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events

                } catch (err) {
                    console.error("SSE Parse Error", err);
                }
            };

            eventSource.onerror = () => {
                console.log("SSE Error, retrying...");
                setIsConnected(false);
                eventSource.close();
                setTimeout(connect, 3000); // Retry after 3s
            };
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
        };
    }, []);

    return (
        <LiveContext.Provider value={{ events, isConnected, latestEvent }}>
            {children}
        </LiveContext.Provider>
    );
};
