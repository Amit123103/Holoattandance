import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveAttendanceToQueue, getPendingUploads, removeUpload } from '../utils/offlineStorage';
import api from '../api/axiosConfig';

const NetworkContext = createContext();

export function useNetwork() {
    return useContext(NetworkContext);
}

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check for pending items
        updatePendingCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updatePendingCount = async () => {
        const uploads = await getPendingUploads();
        setPendingCount(uploads.length);
    };

    const syncOfflineData = async () => {
        if (isSyncing) return;

        const uploads = await getPendingUploads();
        if (uploads.length === 0) return;

        setIsSyncing(true);
        console.log(`Starting sync for ${uploads.length} items...`);

        try {
            for (const item of uploads) {
                try {
                    // Re-upload the data
                    // We assume the stored item has the same structure as the API payload
                    await api.post('/api/attendance/verify', item.payload);
                    await removeUpload(item.id);
                    console.log(`Synced item ${item.id}`);
                } catch (error) {
                    console.error(`Failed to sync item ${item.id}`, error);
                    // Leave in queue to retry later? or remove if it's a 400 error?
                    // For now, we keep it in queue if network error, maybe add retry count later.
                }
            }
        } finally {
            setIsSyncing(false);
            updatePendingCount();
        }
    };

    const saveOffline = async (payload) => {
        await saveAttendanceToQueue({ payload });
        await updatePendingCount();
        console.log("Saved to offline queue");
    };

    return (
        <NetworkContext.Provider value={{ isOnline, pendingCount, isSyncing, saveOffline, syncOfflineData }}>
            {children}
            {/* Global Offline Indicator */}
            {!isOnline && (
                <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-xs z-50 animate-pulse">
                    You are currently offline. Records will be saved locally.
                </div>
            )}
            {/* Sync Indicator */}
            {isSyncing && (
                <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-xs z-50">
                    Syncing offline records...
                </div>
            )}
        </NetworkContext.Provider>
    );
}
