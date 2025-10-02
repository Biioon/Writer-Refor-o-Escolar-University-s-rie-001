import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DB_NAME = 'WriterUniversityDB';
const STORE_NAME = 'files';
const DB_VERSION = 1;

interface StoredFile {
  id: number;
  name: string;
  type: string;
  file: Blob;
}

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: StoredFile;
    indexes: { 'name': string };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }
  return dbPromise;
};

export const addFile = async (file: File): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.add({
    // @ts-ignore id is auto-incrementing
    name: file.name,
    type: file.type,
    file: new Blob([await file.arrayBuffer()], { type: file.type }),
  });
  await tx.done;
};

export const getFilesMeta = async (): Promise<{ id: number, name: string, type: string }[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const allFiles = await store.getAll();
  return allFiles.map(({ id, name, type }) => ({ id, name, type }));
};

export const getFile = async (id: number): Promise<Blob | undefined> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const record = await store.get(id);
  return record?.file;
};

export const deleteFile = async (id: number): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(id);
  await tx.done;
};
