import { Seat } from '../types';

const DB_NAME = 'seatsDB';
const STORE_NAME = 'seats';
const DB_VERSION = 1;

let db: IDBDatabase;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getAllSeats = async (): Promise<Record<string, Seat>> => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const seats = request.result.reduce((acc: Record<string, Seat>, seat: Seat) => {
        acc[seat.id] = {
          ...seat,
          lastUpdate: new Date(seat.lastUpdate)
        };
        return acc;
      }, {});
      resolve(seats);
    };
  });
};

export const updateSeat = async (seat: Seat): Promise<void> => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(seat);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const resetAllSeats = async (): Promise<void> => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};