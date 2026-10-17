import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Public web config (safe in the browser). Env vars override; defaults = coffeshop-3d project.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBF3TANXtMLzYF5TBOvAFRYpkiffX-3lYk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'coffeshop-3d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'coffeshop-3d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'coffeshop-3d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '47439197353',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:47439197353:web:6301d0367cb6005cd4a5b8',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Faster, more reliable Firestore connection:
 *  - experimentalAutoDetectLongPolling: on networks / ISPs / browser extensions that block the default
 *    WebChannel stream, Firestore used to hang for many seconds before giving up. This switches
 *    to long-polling automatically instead, so reads and writes stop "taking forever".
 *  - persistentLocalCache: the site and admin panel open instantly from the on-device cache and
 *    refresh from the server in the background.
 */
function createDb(): Firestore {
  if (typeof window === 'undefined') return getFirestore(app); // server render: plain instance
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Already initialised (hot reload) or IndexedDB unavailable (private mode) - use what exists.
    return getFirestore(app);
  }
}

export const db = createDb();
export const auth = getAuth(app);

export const COLLECTIONS = {
  SETTINGS: 'cafe_settings',
  MENU_ITEMS: 'menu_items',
  TABLE_BOOKINGS: 'table_bookings',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
} as const;

export const SETTINGS_DOC_ID = 'general';
