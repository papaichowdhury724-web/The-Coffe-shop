export type ThemePreset = 
  | 'velvet-obsidian' 
  | 'roasted-espresso' 
  | 'warm-caramel' 
  | 'matcha-emerald' 
  | 'cyber-roast' 
  | 'nordic-ivory';

export type LoadingAnimationStyle = 
  | 'espresso-fill' 
  | 'monogram-glow' 
  | 'roaster-ring' 
  | 'vintage-dial' 
  | 'minimal-fade';

export type ScrollAnimationStyle = 
  | '3d-camera-orbit' 
  | 'cinematic-parallax' 
  | 'velvet-fade-slide' 
  | 'split-story';

export type HoverEffectStyle = 
  | 'magnetic-glow' 
  | 'velvet-lift' 
  | 'liquid-ripple' 
  | 'golden-border';

export type CursorStyle = 
  | 'coffee-bean' 
  | 'golden-ring' 
  | 'velvet-dot' 
  | 'default';

export type TickerPosition = 'top' | 'bottom' | 'floating';

export interface BookingFieldConfig {
  id: string;
  label: string;
  visible: boolean;
  required: boolean;
}

export interface TableBookingSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  maxPartySize: number;
  timeSlots: string[];
  seatingAreas: {
    id: string;
    name: string;
    description: string;
    image: string;
    capacity: string;
  }[];
  fields: {
    name: BookingFieldConfig;
    phone: BookingFieldConfig;
    email: BookingFieldConfig;
    seatingArea: BookingFieldConfig;
    guests: BookingFieldConfig;
    date: BookingFieldConfig;
    timeSlot: BookingFieldConfig;
    specialRequest: BookingFieldConfig;
    occasion: BookingFieldConfig;
  };
  policyText: string;
  confirmationNotice: string;
}

export interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  mediaType?: 'image' | 'video' | 'canvas';
  mediaUrl?: string;
}

export interface ThemeConfig {
  preset: ThemePreset;
  primaryColor: string; // e.g. #D4AF37 or #E0A96D
  accentColor: string; // e.g. #C68B59
  backgroundColor: string; // e.g. #0A0807 or #120D0A
  cardBackground: string; // e.g. #16110E
  textColor: string; // e.g. #FDF8F0
  glowIntensity: 'subtle' | 'medium' | 'high' | 'off';
  glassmorphism: boolean;
}

export interface TypographyConfig {
  headingFont: 'Playfair Display' | 'Cinzel' | 'Cormorant Garamond' | 'Montserrat' | 'Outfit' | 'Syne' | 'Plus Jakarta Sans';
  bodyFont: 'Plus Jakarta Sans' | 'Montserrat' | 'Outfit' | 'Inter' | 'Lora';
  titleScale: number; // 0.8 to 1.4
  bodyScale: number; // 0.8 to 1.3
  cartFontSize: number; // 12 to 20 px
}

export interface AnimationConfig {
  loadingStyle: LoadingAnimationStyle;
  scrollStyle: ScrollAnimationStyle;
  hoverStyle: HoverEffectStyle;
  cursorStyle: CursorStyle;
  enableSoundscape: boolean;
  enableClickSounds: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  enableMotionBlur: boolean;
  reducedMotion: boolean;
}

export interface MarqueeTickerConfig {
  enabled: boolean;
  position: TickerPosition;
  isLocked: boolean; // if false, can be closed/dismissed
  type: 'offer' | 'mosque_prayer' | 'roast_alert' | 'custom';
  message: string;
  badgeText: string;
  linkText?: string;
  linkUrl?: string;
  prayerTimes?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export interface LinkItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  visible: boolean;
}

export interface HeaderConfig {
  brandName: string;
  brandTagline: string;
  logoType: 'text' | 'image';
  logoUrl?: string;
  navLinks: { id: string; label: string; href: string; visible: boolean }[];
  showBookingCta: boolean;
  ctaText: string;
  showSoundToggle: boolean;
  showCartButton: boolean;
  headerStyle: 'floating-glass' | 'solid-dark' | 'transparent-minimal';
}

export interface FooterConfig {
  brandName: string;
  /** Small line under the brand name, e.g. "Haute Patisserie & Royal Confectionery" */
  tagline: string;
  description: string;

  // Contact & hours
  hoursTitle: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  weekendHours: string;
  hoursNote: string;

  // Social pills (add / remove / hide / reorder from the admin panel)
  socialLinks: SocialLink[];
  /** Used by the "Directions" button in the Location section */
  mapsUrl: string;

  // Quick links column
  quickLinksTitle: string;
  quickLinks: LinkItem[];

  // Newsletter
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;

  // Bottom bar
  copyrightText: string;
  quote: string;
  bottomLinks: LinkItem[];
  showAdminLink: boolean;
  adminLinkLabel: string;

  /** Legacy fields (older saved data) - migrated into socialLinks automatically. */
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  origin?: string;
  roastLevel?: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark Espresso';
  flavorNotes?: string[];
  calories?: number;
  badge?: string; // "Signature", "Award Winner", "Chef's Special", "Nitro", "Organic"
  isAvailable: boolean;
  isFeatured?: boolean;
  brewMethod?: string;
  orderIndex: number;
}

export interface CartCustomization {
  roast?: string;
  milk?: 'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Coconut Milk' | 'None (Black)';
  sweetness?: '0%' | '25%' | '50%' | '100%';
  temperature?: 'Hot (68°C)' | 'Iced Over Diamond Rocks' | 'Nitro Chilled';
  extraShots?: number;
  note?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization?: CartCustomization;
  calculatedPrice: number;
}

export interface TableBookingRecord {
  id: string;
  bookingRef: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: string;
  specialRequest?: string;
  occasion?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  description: string;
  isActive: boolean;
  validUntil?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  role?: string;
  rating: number;
  comment: string;
  avatar?: string;
  isApproved: boolean;
  date: string;
}

export interface CafeSettings {
  siteName: string;
  tagline: string;
  currency: string;
  currencyPosition: 'prefix' | 'suffix';
  taxPercent: number;
  serviceChargePercent: number;
  freeComplimentaryGiftMin: number;
  theme: ThemeConfig;
  typography: TypographyConfig;
  animation: AnimationConfig;
  ticker: MarqueeTickerConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  sections: SectionConfig[];
  booking: TableBookingSettings;
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    stats: { label: string; value: string }[];
  };
  story: {
    badge: string;
    title: string;
    subtitle: string;
    paragraphs: string[];
    videoUrl?: string;
    stats: { number: string; label: string }[];
  };
}
