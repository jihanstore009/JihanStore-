import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  increment
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadString 
} from 'firebase/storage';
import { optimizeImageForUpload, ImageOptimizationOptions } from '../utils/imageProcessor';

// Direct config from provisioned Firebase project
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the provisioned database ID if provided, otherwise default
const databaseId = appletConfig.firestoreDatabaseId || undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true
  }, databaseId);
} catch (e) {
  firestoreInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

let storageInstance;
try {
  storageInstance = getStorage(app);
} catch (err) {
  console.warn('Firebase Storage init notice:', err);
}
export const storage = storageInstance;

export interface UploadMediaResult {
  url: string;
  source: 'cloud_storage' | 'optimized_client_storage';
  storageSuccess: boolean;
  sizeBytes: number;
  mimeType: string;
  storageError?: string;
}

/**
 * Resilient image and media uploader with strict timeout, pre-processing,
 * and fail-safe fallback.
 * 
 * 1. Optimizes the image client-side to prevent huge payloads.
 * 2. Attempts Firebase Storage upload with a strict 5000ms timeout.
 * 3. If Firebase Storage is unavailable or times out, immediately falls back
 *    to the optimized compact data URL (<60KB) which is guaranteed to fit in Firestore.
 * 4. Never leaves caller promises hanging indefinitely.
 */
export async function uploadMediaWithDetails(
  file: File | Blob,
  storagePath: string,
  options: ImageOptimizationOptions & { timeoutMs?: number } = {}
): Promise<UploadMediaResult> {
  const { timeoutMs = 5000, maxWidth = 800, maxHeight = 800, quality = 0.85 } = options;

  // 1. Process and optimize the image first
  const processed = await optimizeImageForUpload(file, {
    maxWidth,
    maxHeight,
    quality,
    format: options.format
  });

  // 2. Try Firebase Storage upload if storage is initialized
  if (storage) {
    let timeoutHandle: any;
    try {
      const sanitizedPath = storagePath.replace(/[^a-zA-Z0-9_/.-]/g, '_');
      const uniquePath = `${sanitizedPath}_${Date.now()}`;
      const storageRef = ref(storage, uniquePath);

      // Timeout promise to prevent infinite spinner
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Firebase Storage upload timed out after ${timeoutMs / 1000}s`));
        }, timeoutMs);
      });

      // Firebase Storage upload promise
      const uploadPromise = async (): Promise<string> => {
        const metadata = {
          contentType: processed.mimeType,
          cacheControl: 'public, max-age=31536000',
        };
        const snapshot = await uploadBytes(storageRef, processed.blob, metadata);
        return await getDownloadURL(snapshot.ref);
      };

      const downloadUrl = await Promise.race([uploadPromise(), timeoutPromise]);
      clearTimeout(timeoutHandle);

      return {
        url: downloadUrl,
        source: 'cloud_storage',
        storageSuccess: true,
        sizeBytes: processed.sizeBytes,
        mimeType: processed.mimeType
      };
    } catch (storageErr: any) {
      clearTimeout(timeoutHandle);
      const errMsg = storageErr?.message || String(storageErr);
      console.warn('Firebase Storage upload notice (falling back to optimized client encoding):', errMsg);

      return {
        url: processed.dataUrl,
        source: 'optimized_client_storage',
        storageSuccess: false,
        sizeBytes: processed.sizeBytes,
        mimeType: processed.mimeType,
        storageError: errMsg
      };
    }
  }

  // If storage is not available, return processed data URL directly
  return {
    url: processed.dataUrl,
    source: 'optimized_client_storage',
    storageSuccess: false,
    sizeBytes: processed.sizeBytes,
    mimeType: processed.mimeType,
    storageError: 'Firebase Storage is not initialized'
  };
}

/**
 * Standard uploadMedia returning URL directly
 */
export async function uploadMedia(
  file: File | Blob,
  storagePath: string,
  options?: ImageOptimizationOptions & { timeoutMs?: number }
): Promise<string> {
  const result = await uploadMediaWithDetails(file, storagePath, options);
  return result.url;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  increment,
  type User
};
