# Cinematic Coffee Shop - Firebase setup (coffeshop-3d)

PostgreSQL is gone. Everything (menu, settings, coupons, reviews, bookings) is now stored in Firebase Firestore,
and the admin panel (/admin) logs in with Firebase Email/Password.

## One-time setup (Firebase Console -> project coffeshop-3d)
1. Build -> Firestore Database -> Create database (production mode is fine).
2. Firestore -> Rules tab -> paste the contents of `firestore.rules` -> Publish.
3. Build -> Authentication -> Users -> Add user (this is your admin email + password).
   (Email/Password sign-in is already enabled.)
4. Authentication -> Settings -> User actions -> turn OFF "Enable create (sign-up)" (so only the admin you added can ever log in).
5. Authentication -> Settings -> Authorized domains -> add your live domain (localhost is already there).

## Run
    npm install
    npm run dev
Open http://localhost:3000/admin, log in. On the very first login the default menu, settings,
coupons and reviews are uploaded to Firestore automatically. After that, every change in the admin
panel shows live on the website.

## Notes
- Images uploaded in the admin panel are compressed and stored inside the Firestore document (1 MB limit per document).
  For many/large photos prefer image links (or enable Firebase Storage later).
- Table bookings are private: visitors can create one, only the logged-in admin can read them.
- Firebase config is in `src/lib/firebase.ts` (can be overridden with .env.local).

## Bug-fix notes (latest)
- Header no longer overlaps the announcement bar (header `top` was being animated by `transition-all`).
- Footer is 100% driven by Admin -> Header & Footer (brand, tagline, socials, quick links, hours, contact,
  newsletter, bottom links, admin link). Old saved footer data is migrated automatically.
- Admin is faster: optimistic saves (UI updates instantly, Firebase confirms in background), Firestore
  auto long-polling + local cache, lazy-loaded tabs, memoised context, silent typing in the Ticker tab.
