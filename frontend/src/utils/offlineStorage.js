import { openDB } from 'idb';

const DB_NAME = 'holo-offline-db';
const STORE_NAME = 'attendance_queue';

async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

export async function saveAttendanceToQueue(data) {
    const db = await getDB();
    return db.add(STORE_NAME, {
        ...data,
        createdAt: new Date().toISOString(),
    });
}

export async function getPendingUploads() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}

export async function removeUpload(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
}

export async function clearQueue() {
    const db = await getDB();
    return db.clear(STORE_NAME);
}

export async function getQueueCount() {
    const db = await getDB();
    return db.count(STORE_NAME);
}
