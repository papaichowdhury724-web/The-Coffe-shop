'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, getDoc,
} from 'firebase/firestore';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import { db, auth, COLLECTIONS, SETTINGS_DOC_ID } from '@/lib/firebase';
import { 
  CafeSettings, 
  MenuItem, 
  TableBookingRecord, 
  Coupon, 
  ReviewItem, 
  CartItem, 
  CartCustomization 
} from '@/lib/types';
import { 
  initialCafeSettings, 
  initialMenuItems, 
  initialCoupons, 
  initialReviews 
} from '@/lib/default-data';

interface CafeContextType {
  settings: CafeSettings;
  updateSettings: (newSettings: Partial<CafeSettings>) => void;
  resetSettings: () => void | Promise<void>;

  /** Single source of truth for the brand name shown everywhere on the site. */
  brandName: string;
  /** False until saved data has been read from localStorage (avoids flashing default content). */
  isHydrated: boolean;
  /** Admin edits are staged as a draft until saveChanges() is called. */
  hasUnsavedChanges: boolean;
  saveChanges: () => void | Promise<void>;
  discardChanges: () => void;
  /** True while a save is still being confirmed by Firebase (the UI itself already shows the new data). */
  isSaving: boolean;
  
  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'orderIndex'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Bookings
  bookings: TableBookingRecord[];
  addBooking: (booking: Omit<TableBookingRecord, 'id' | 'bookingRef' | 'createdAt' | 'status'>) => TableBookingRecord;
  updateBookingStatus: (id: string, status: TableBookingRecord['status']) => void;
  deleteBooking: (id: string) => void;
  
  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Reviews
  reviews: ReviewItem[];
  addReview: (review: Omit<ReviewItem, 'id' | 'date' | 'isApproved'>) => void;
  toggleReviewApproval: (id: string) => void;
  deleteReview: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, customization?: CartCustomization, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTax: number;
  cartTotal: number;
  
  // Audio & Soundscape
  isPlayingSoundscape: boolean;
  toggleSoundscape: () => void;
  soundscapeVibe: 'jazz' | 'rain' | 'roastery';
  setSoundscapeVibe: (vibe: 'jazz' | 'rain' | 'roastery') => void;
  soundVolume: number;
  setSoundVolume: (vol: number) => void;
  playClickSound: () => void;
  
  // Modals & Booking Drawer
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  selectedBookingArea: string | null;
  setSelectedBookingArea: (areaId: string | null) => void;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Scroll progress for cinematic canvas
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  // Admin (Firebase Authentication - email/password)
  isAdminLoggedIn: boolean;
  /** False until Firebase has told us whether someone is logged in. */
  authReady: boolean;
  adminEmail: string | null;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  /** Upload the built-in default menu/settings/coupons/reviews to Firestore (admin only). */
  seedDefaults: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

// Only the visitor's cart stays in the browser. Everything else lives in Firestore.
const STORAGE_KEYS = {
  CART: 'auranoir_cart_v2',
};

/** Firestore rejects `undefined` values - strip them. */
function clean<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Firestore documents are limited to 1 MB. */
function tooBig(v: unknown): boolean {
  try { return new Blob([JSON.stringify(v)]).size > 980_000; } catch { return false; }
}

function errMsg(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  if (code.includes('permission-denied')) return 'Permission denied - please log in to the admin panel (and publish firestore.rules).';
  if (code.includes('unavailable')) return 'No connection to Firebase. Check your internet.';
  return 'Firebase error: ' + ((e as Error)?.message || code || 'unknown');
}

/** localStorage can throw (private mode, quota, blocked cookies) — never let that crash the UI. */
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Could not persist', key, e);
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Merge saved settings on top of defaults so that a settings object saved by an
 * older version of the site (missing newer keys) can never crash a component.
 */
function mergeDeep<T>(defaults: T, saved: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(saved)) {
    return (saved === undefined || saved === null ? defaults : saved) as T;
  }
  const out: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(saved)) {
    out[key] = key in defaults
      ? mergeDeep((defaults as Record<string, unknown>)[key], saved[key])
      : saved[key];
  }
  return out as T;
}

/**
 * Older saved data stored the social links as three fixed fields (instagramUrl / facebookUrl / mapsUrl).
 * Convert them into the editable `socialLinks` list so nothing the admin typed earlier is lost.
 */
function migrateSaved(raw: Record<string, unknown>): Record<string, unknown> {
  const footer = raw.footer;
  if (!isPlainObject(footer) || Array.isArray(footer.socialLinks)) return raw;
  const links: { id: string; label: string; url: string; visible: boolean }[] = [];
  if (typeof footer.instagramUrl === 'string' && footer.instagramUrl) {
    links.push({ id: 'instagram', label: 'Instagram', url: footer.instagramUrl, visible: true });
  }
  if (typeof footer.facebookUrl === 'string' && footer.facebookUrl) {
    links.push({ id: 'facebook', label: 'Facebook', url: footer.facebookUrl, visible: true });
  }
  if (typeof footer.mapsUrl === 'string' && footer.mapsUrl) {
    links.push({ id: 'maps', label: 'Location Map', url: footer.mapsUrl, visible: true });
  }
  if (!links.length) return raw;
  return { ...raw, footer: { ...footer, socialLinks: links } };
}

/** Keep siteName / header.brandName / footer.brandName identical so the name is the same everywhere. */
function syncBrand(prev: CafeSettings, next: CafeSettings, patch: Partial<CafeSettings>): CafeSettings {
  let brand: string | null = null;
  if (patch.siteName !== undefined && patch.siteName !== prev.siteName) brand = patch.siteName;
  else if (patch.header && patch.header.brandName !== prev.header.brandName) brand = patch.header.brandName;
  else if (patch.footer && patch.footer.brandName !== prev.footer.brandName) brand = patch.footer.brandName;
  if (brand === null) return next;
  return {
    ...next,
    siteName: brand,
    header: { ...next.header, brandName: brand },
    footer: { ...next.footer, brandName: brand },
  };
}

function applyPatch(prev: CafeSettings, patch: Partial<CafeSettings>): CafeSettings {
  return syncBrand(prev, { ...prev, ...patch }, patch);
}

/** Old saved data may have different names in different places — header name wins. */
function normalizeBrand(s: CafeSettings): CafeSettings {
  const brand = s.header?.brandName || s.siteName || s.footer?.brandName;
  if (!brand) return s;
  return {
    ...s,
    siteName: brand,
    header: { ...s.header, brandName: brand },
    footer: { ...s.footer, brandName: brand },
  };
}

export function CafeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = !!pathname && pathname.startsWith('/admin');
  const isAdminRouteRef = useRef(isAdminRoute);

  // `savedSettings` is what visitors see. `draftSettings` holds un-saved admin edits.
  const [savedSettings, setSavedSettings] = useState<CafeSettings>(initialCafeSettings);
  const [draftSettings, setDraftSettings] = useState<CafeSettings | null>(null);
  const savedRef = useRef(savedSettings);
  const draftRef = useRef<CafeSettings | null>(null);
  useEffect(() => {
    isAdminRouteRef.current = isAdminRoute;
    savedRef.current = savedSettings;
    draftRef.current = draftSettings;
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inside /admin the editor sees (and previews) the draft; everywhere else the saved version.
  const settings = isAdminRoute && draftSettings ? draftSettings : savedSettings;
  const hasUnsavedChanges = isAdminRoute && draftSettings !== null;
  const brandName = settings.header.brandName || settings.siteName || 'AURA NOIR';
  const [fsMenuItems, setFsMenuItems] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<TableBookingRecord[]>([]);
  const [fsCoupons, setFsCoupons] = useState<Coupon[]>([]);
  const [fsReviews, setFsReviews] = useState<ReviewItem[]>([]);
  /** True once the Firestore settings document exists (site has been seeded). */
  const [isSeeded, setIsSeeded] = useState(false);
  // Until the database has been seeded by the admin, visitors see the built-in default content.
  const menuItems = isSeeded ? fsMenuItems : initialMenuItems;
  const coupons = isSeeded ? fsCoupons : initialCoupons;
  const reviews = isSeeded ? fsReviews : initialReviews;
  const menuItemsRef = useRef<MenuItem[]>(initialMenuItems);
  const couponsRef = useRef<Coupon[]>(initialCoupons);
  const reviewsRef = useRef<ReviewItem[]>(initialReviews);
  const bookingsRef = useRef<TableBookingRecord[]>([]);
  useEffect(() => { menuItemsRef.current = menuItems; couponsRef.current = coupons; reviewsRef.current = reviews; bookingsRef.current = bookings; });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingArea, setSelectedBookingArea] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Soundscape
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(false);
  const [soundscapeVibe, setSoundscapeVibe] = useState<'jazz' | 'rain' | 'roastery'>('jazz');
  const [soundVolume, setSoundVolume] = useState(0.4);

  // Admin login = Firebase Authentication (email/password)
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const isAdminLoggedIn = !!user;
  const adminEmail = user?.email ?? null;
  const userRef = useRef<User | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true, message: 'Welcome back.' };
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) {
        return { success: false, message: 'Wrong email or password.' };
      }
      if (code.includes('too-many-requests')) return { success: false, message: 'Too many attempts. Try again in a few minutes.' };
      if (code.includes('operation-not-allowed')) return { success: false, message: 'Email/Password sign-in is not enabled in Firebase Authentication.' };
      return { success: false, message: errMsg(e) };
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    await signOut(auth);
  }, []);

  // Cart is the only thing kept locally
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.warn('Failed to load cart:', e);
    }
  }, []);

  // Live Firestore subscriptions (public content) - the site updates in real time
  useEffect(() => {
    let settled = false;
    const markReady = () => { if (!settled) { settled = true; setIsHydrated(true); } };
    // Never keep visitors on the loader if Firebase is slow/unreachable - show defaults.
    const fallback = setTimeout(markReady, 5000);

    const unsubs: Array<() => void> = [];

    unsubs.push(onSnapshot(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), (snap) => {
      if (snap.exists()) {
        setSavedSettings(normalizeBrand(mergeDeep(initialCafeSettings, migrateSaved(snap.data()))));
        setIsSeeded(true);
      } else {
        setIsSeeded(false);
      }
      markReady();
    }, (e) => { console.warn('settings listener:', e); markReady(); }));

    unsubs.push(onSnapshot(collection(db, COLLECTIONS.MENU_ITEMS), (snap) => {
      const items = snap.docs.map(d => ({ ...(d.data() as MenuItem), id: d.id }));
      items.sort((x, y) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0));
      setFsMenuItems(items);
    }, (e) => console.warn('menu listener:', e)));

    unsubs.push(onSnapshot(collection(db, COLLECTIONS.COUPONS), (snap) => {
      setFsCoupons(snap.docs.map(d => ({ ...(d.data() as Coupon), id: d.id })));
    }, (e) => console.warn('coupons listener:', e)));

    unsubs.push(onSnapshot(collection(db, COLLECTIONS.REVIEWS), (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as ReviewItem & { createdAt?: number }), id: d.id }));
      list.sort((x, y) => (y.createdAt ?? 0) - (x.createdAt ?? 0));
      setFsReviews(list);
    }, (e) => console.warn('reviews listener:', e)));

    return () => {
      clearTimeout(fallback);
      unsubs.forEach(u => u());
    };
  }, []);

  // Bookings are private: only listen when the admin is logged in.
  useEffect(() => {
    if (!user) { setBookings([]); return; }
    return onSnapshot(collection(db, COLLECTIONS.TABLE_BOOKINGS), (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as TableBookingRecord), id: d.id }));
      list.sort((x, y) => (y.createdAt || '').localeCompare(x.createdAt || ''));
      setBookings(list);
    }, (e) => console.warn('bookings listener:', e));
  }, [user]);

  // Leaving /admin without saving throws the draft away.
  useEffect(() => {
    if (!isAdminRoute) setDraftSettings(null);
  }, [isAdminRoute]);

  // Warn before closing the tab with un-saved admin edits.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  // Browser tab title follows the brand name.
  useEffect(() => {
    if (!isHydrated) return;
    document.title = isAdminRoute
      ? `${brandName} • Admin`
      : `${brandName}${savedSettings.tagline ? ' • ' + savedSettings.tagline : ''}`;
  }, [isHydrated, isAdminRoute, brandName, savedSettings.tagline]);

  // In /admin edits go to the draft (nothing changes for visitors until "Save").
  const updateSettings = useCallback((newSettings: Partial<CafeSettings>) => {
    if (isAdminRouteRef.current) {
      setDraftSettings(prev => applyPatch(prev ?? savedRef.current, newSettings));
    } else {
      setSavedSettings(prev => applyPatch(prev, newSettings));
    }
  }, []);

  // Toast — a new toast replaces the old one and restarts the timer (no early dismiss).
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3800);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  /**
   * Fire-and-confirm: the screen updates immediately (Firestore applies writes to its local cache
   * first), the toast shows right away, and only a failure is reported afterwards.
   * Before this, every action waited for the server round-trip before anything happened.
   */
  const fireWrite = useCallback((write: Promise<unknown>, okMessage?: string) => {
    if (okMessage) showToast(okMessage);
    write.catch((e) => showToast(errMsg(e)));
  }, [showToast]);

  /** Writes the built-in defaults to Firestore. `force=false` only seeds an empty database. */
  const seedDefaultsInternal = useCallback(async (force: boolean) => {
    if (!userRef.current) return;
    try {
      if (!force) {
        const existing = await getDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID));
        if (existing.exists()) return;
      }
      const batch = writeBatch(db);
      batch.set(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), clean(initialCafeSettings));
      initialMenuItems.forEach(m => batch.set(doc(db, COLLECTIONS.MENU_ITEMS, m.id), clean(m)));
      initialCoupons.forEach(c => batch.set(doc(db, COLLECTIONS.COUPONS, c.id), clean(c)));
      initialReviews.forEach((r, i) => batch.set(doc(db, COLLECTIONS.REVIEWS, r.id), clean({ ...r, createdAt: Date.now() - i * 1000 })));
      await batch.commit();
      showToast('Default menu, settings, coupons and reviews uploaded to Firebase.');
    } catch (e) {
      showToast(errMsg(e));
    }
  }, [showToast]);

  const seedDefaults = useCallback(() => seedDefaultsInternal(true), [seedDefaultsInternal]);

  // First admin login on an empty database: upload the default content automatically.
  useEffect(() => {
    if (user && authReady) void seedDefaultsInternal(false);
  }, [user, authReady, seedDefaultsInternal]);

  const resetSettings = useCallback(async () => {
    setDraftSettings(null);
    // remove current menu/coupons that are not part of the defaults, then re-seed
    try {
      const batch = writeBatch(db);
      menuItemsRef.current.forEach(m => batch.delete(doc(db, COLLECTIONS.MENU_ITEMS, m.id)));
      couponsRef.current.forEach(c => batch.delete(doc(db, COLLECTIONS.COUPONS, c.id)));
      await batch.commit();
    } catch (e) {
      showToast(errMsg(e));
      return;
    }
    await seedDefaultsInternal(true);
    showToast('All settings reset to the default configuration.');
  }, [seedDefaultsInternal, showToast]);

  const saveChanges = useCallback(async () => {
    const draft = draftRef.current;
    if (!draft) return;
    if (tooBig(draft)) {
      showToast('Settings are too large for Firebase (1 MB limit). Use smaller images or image links.');
      return;
    }
    // Optimistic: apply instantly so the admin never waits on the network.
    setSavedSettings(draft);
    setDraftSettings(null);
    setIsSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), clean(draft));
      showToast('Changes saved - your website is updated.');
    } catch (e) {
      // Put the edits back so nothing is lost, and tell the admin why.
      setDraftSettings(prev => prev ?? draft);
      showToast(errMsg(e));
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const discardChanges = useCallback(() => {
    if (!draftRef.current) return;
    setDraftSettings(null);
    showToast('Unsaved changes discarded.');
  }, [showToast]);

  // Menu methods (Firestore: menu_items/{id})
  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id' | 'orderIndex'>) => {
    const minIdx = menuItemsRef.current.reduce((m, i) => Math.min(m, i.orderIndex ?? 0), 1);
    const newItem: MenuItem = { ...item, id: `menu-${Date.now()}`, orderIndex: minIdx - 1 };
    if (tooBig(newItem)) { showToast('This item is too large (1 MB limit). Use a smaller image.'); return; }
    fireWrite(setDoc(doc(db, COLLECTIONS.MENU_ITEMS, newItem.id), clean(newItem)), `Added "${item.name}" to the menu.`);
  }, [showToast, fireWrite]);

  const updateMenuItem = useCallback(async (id: string, itemData: Partial<MenuItem>) => {
    const current = menuItemsRef.current.find(i => i.id === id);
    if (!current) return;
    const merged = { ...current, ...itemData, id };
    if (tooBig(merged)) { showToast('This item is too large (1 MB limit). Use a smaller image.'); return; }
    fireWrite(setDoc(doc(db, COLLECTIONS.MENU_ITEMS, id), clean(merged)), 'Menu item updated.');
  }, [showToast, fireWrite]);

  const deleteMenuItem = useCallback(async (id: string) => {
    fireWrite(deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, id)), 'Menu item removed.');
  }, [fireWrite]);

  // Bookings (Firestore: table_bookings/{id}) - visitors create, only admin can read
  const addBooking = useCallback((bookingData: Omit<TableBookingRecord, 'id' | 'bookingRef' | 'createdAt' | 'status'>) => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newBooking: TableBookingRecord = {
      ...bookingData,
      id: `bk-${Date.now()}-${randomCode}`,
      bookingRef: `AURA-${randomCode}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, COLLECTIONS.TABLE_BOOKINGS, newBooking.id), clean(newBooking))
      .catch((e) => showToast(errMsg(e)));
    return newBooking;
  }, [showToast]);

  const updateBookingStatus = useCallback(async (id: string, status: TableBookingRecord['status']) => {
    const current = bookingsRef.current.find(b => b.id === id);
    if (!current) return;
    fireWrite(setDoc(doc(db, COLLECTIONS.TABLE_BOOKINGS, id), clean({ ...current, status })), `Booking status updated to: ${status.toUpperCase()}`);
  }, [fireWrite]);

  const deleteBooking = useCallback(async (id: string) => {
    fireWrite(deleteDoc(doc(db, COLLECTIONS.TABLE_BOOKINGS, id)), 'Booking deleted.');
  }, [fireWrite]);

  // Coupons methods (Firestore: coupons/{id})
  const addCoupon = useCallback(async (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...couponData, id: `cp-${Date.now()}` };
    fireWrite(setDoc(doc(db, COLLECTIONS.COUPONS, newCoupon.id), clean(newCoupon)), `Coupon ${couponData.code} created.`);
  }, [fireWrite]);

  const updateCoupon = useCallback(async (id: string, couponData: Partial<Coupon>) => {
    const current = couponsRef.current.find(c => c.id === id);
    if (!current) return;
    fireWrite(setDoc(doc(db, COLLECTIONS.COUPONS, id), clean({ ...current, ...couponData, id })), 'Coupon updated.');
  }, [fireWrite]);

  const deleteCoupon = useCallback(async (id: string) => {
    fireWrite(deleteDoc(doc(db, COLLECTIONS.COUPONS, id)), 'Coupon removed.');
  }, [fireWrite]);

  // Apply coupon in cart
  const applyCouponCode = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promo code.' };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  }, [coupons]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Promo code removed.');
  }, [showToast]);

  // Reviews methods (Firestore: reviews/{id}) - visitors can add, admin approves/deletes
  const addReview = useCallback(async (rev: Omit<ReviewItem, 'id' | 'date' | 'isApproved'>) => {
    const id = `rev-${Date.now()}`;
    const newReview = {
      ...rev,
      id,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      isApproved: true,
      createdAt: Date.now(),
    };
    fireWrite(setDoc(doc(db, COLLECTIONS.REVIEWS, id), clean(newReview)), 'Thank you! Your review has been published.');
  }, [fireWrite]);

  const toggleReviewApproval = useCallback(async (id: string) => {
    const current = reviewsRef.current.find(r => r.id === id);
    if (!current) return;
    fireWrite(setDoc(doc(db, COLLECTIONS.REVIEWS, id), clean({ ...current, isApproved: !current.isApproved })));
  }, [fireWrite]);

  const deleteReview = useCallback(async (id: string) => {
    fireWrite(deleteDoc(doc(db, COLLECTIONS.REVIEWS, id)), 'Review removed.');
  }, [fireWrite]);

  // Cart methods
  const addToCart = useCallback((item: MenuItem, customization?: CartCustomization, quantity = 1) => {
    let extraPrice = 0;
    if (customization?.extraShots) extraPrice += customization.extraShots * 1.5;
    if (customization?.milk && customization.milk !== 'Whole Milk' && customization.milk !== 'None (Black)') {
      extraPrice += 0.8;
    }

    const calculatedUnit = item.price + extraPrice;
    const cartItemId = `${item.id}-${customization?.milk || 'standard'}-${customization?.temperature || 'std'}-${customization?.sweetness || 'std'}-${customization?.extraShots || 0}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(i => i.cartItemId === cartItemId ? {
          ...i,
          quantity: i.quantity + quantity,
        } : i);
      } else {
        updated = [...prev, {
          cartItemId,
          menuItem: item,
          quantity,
          customization,
          calculatedPrice: calculatedUnit,
        }];
      }
      persist(STORAGE_KEYS.CART, updated);
      return updated;
    });

    setIsCartOpen(true);
    showToast(`Added ${item.name} to cart.`);
  }, [showToast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => {
      const updated = prev.filter(i => i.cartItemId !== cartItemId);
      persist(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        const updated = prev.filter(i => i.cartItemId !== cartItemId);
        persist(STORAGE_KEYS.CART, updated);
        return updated;
      }
      const updated = prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i);
      persist(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CART);
    } catch {
      /* ignore */
    }
  }, []);

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);
  
  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      cartDiscount = Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
  }

  const discountedSubtotal = Math.max(0, cartSubtotal - cartDiscount);
  const cartTax = (discountedSubtotal * (settings.taxPercent || 0)) / 100;
  const cartTotal = discountedSubtotal + cartTax;

  // Web Audio Synthesizer for ambient sound and click sounds
  // One shared AudioContext: creating a new one per click leaks (browsers cap how many can exist)
  // and eventually makes audio and the main thread stutter.
  const clickAudioCtxRef = useRef<AudioContext | null>(null);
  const playClickSound = useCallback(() => {
    if (!settings.animation.enableClickSounds) return;
    try {
      if (!clickAudioCtxRef.current || clickAudioCtxRef.current.state === 'closed') {
        clickAudioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = clickAudioCtxRef.current;
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio not permitted or not supported
    }
  }, [settings.animation.enableClickSounds]);

  const toggleSoundscape = useCallback(() => {
    setIsPlayingSoundscape(prev => !prev);
  }, []);

  // One stable object: consumers only re-render when something they could read has really changed.
  const value = useMemo<CafeContextType>(() => ({
    settings,
    updateSettings,
    resetSettings,
    brandName,
    isHydrated,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    bookings,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    reviews,
    addReview,
    toggleReviewApproval,
    deleteReview,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cartTotal,
    isPlayingSoundscape,
    toggleSoundscape,
    soundscapeVibe,
    setSoundscapeVibe,
    soundVolume,
    setSoundVolume,
    playClickSound,
    isBookingModalOpen,
    setIsBookingModalOpen,
    selectedBookingArea,
    setSelectedBookingArea,
    toastMessage,
    showToast,
    scrollProgress,
    setScrollProgress,
    isAdminLoggedIn,
    authReady,
    adminEmail,
    loginAdmin,
    logoutAdmin,
    seedDefaults,
    isSaving,
  }), [
    settings,
    updateSettings,
    resetSettings,
    brandName,
    isHydrated,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    bookings,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    reviews,
    addReview,
    toggleReviewApproval,
    deleteReview,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cartTotal,
    isPlayingSoundscape,
    toggleSoundscape,
    soundscapeVibe,
    setSoundscapeVibe,
    soundVolume,
    setSoundVolume,
    playClickSound,
    isBookingModalOpen,
    setIsBookingModalOpen,
    selectedBookingArea,
    setSelectedBookingArea,
    toastMessage,
    showToast,
    scrollProgress,
    setScrollProgress,
    isAdminLoggedIn,
    authReady,
    adminEmail,
    loginAdmin,
    logoutAdmin,
    seedDefaults,
    isSaving,
  ]);

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
}
