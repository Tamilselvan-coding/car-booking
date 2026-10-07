'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'ta' | 'en';

export interface Translations {
  [key: string]: {
    en: string;
    ta: string;
  };
}

export const dictionary: Translations = {
  // Common
  appName: { en: 'Chettinad Express', ta: 'செட்டிநாடு எக்ஸ்பிரஸ்' },
  tagline: { en: 'Tamil Nadu Drop Taxi', ta: 'தமிழ்நாட்டின் முன்னணி ஒன் வே டிராப் டாக்ஸி' },
  close: { en: 'Close', ta: 'மூடுக' },
  cancel: { en: 'Cancel', ta: 'ரத்து செய்' },
  save: { en: 'Save', ta: 'சேமி' },
  search: { en: 'Search...', ta: 'தேடவும்...' },
  loading: { en: 'Loading...', ta: 'ஏற்றுகிறது...' },
  bookTaxi: { en: 'Book Taxi', ta: 'டாக்ஸி முன்பதிவு' },
  callNow: { en: 'Call Now', ta: 'அழைக்கவும்' },
  whatsApp: { en: 'WhatsApp', ta: 'வாட்ஸ்அப்' },
  adminPortal: { en: 'Admin Portal', ta: 'அட்மின் போர்ட்டல்' },

  // Offer Banner
  specialOffer: { en: 'Festive Special Offer', ta: 'தீபாவளி & பண்டிகை சிறப்பு சலுகை' },
  startLocation: { en: 'Starting Location', ta: 'பயணம் தொடங்கும் இடம்' },
  destLocation: { en: 'Destination Location', ta: 'சேரும் இடம்' },
  routeDetails: { en: 'Route Details', ta: 'பயண வழித்தடம்' },
  selectVehicle: { en: 'Select Vehicle Type', ta: 'வாகன வகை தேர்வு (டிராப் டவுன்)' },
  actualPrice: { en: 'Actual Amount', ta: 'வழக்கமான கட்டணம் (ஆக்சுவல்)' },
  offerPrice: { en: 'Special Offer Price', ta: 'சிறப்பு தள்ளுபடி விலை' },
  totalSavings: { en: 'Total Savings', ta: 'மொத்த சேமிப்பு' },
  validityPeriod: { en: 'Validity Period', ta: 'செல்லுபடியாகும் சலுகைக் காலம்' },
  validFromTo: { en: 'Valid From', ta: 'எப்போது முதல் எப்போது வரை' },
  quotationRef: { en: 'Quotation / Order Ref', ta: 'கொட்டேஷன் / சேல்ஸ் ஆர்டர் எண்' },
  quotationTerms: { en: 'Quotation Terms & Inclusions', ta: 'கொட்டேஷன் நிபந்தனைகள் & விவரங்கள்' },
  claimOffer: { en: 'Claim Offer & Book Taxi', ta: 'சலுகையை முன்பதிவு செய்' },
  continueWebsite: { en: 'Continue to Website', ta: 'தளத்திற்குச் செல்ல (மூடுக)' },
  autoCloseIn: { en: 'Auto-closing in', ta: 'தானாக மூடும் நேரம்' },

  // Admin Panel
  adminWorkspace: { en: 'Admin Control Workspace', ta: 'அட்மின் கட்டுப்பாட்டு அறை' },
  bannerApprovalTitle: { en: 'Offer Banner Approval & Database System', ta: 'சலுகை பேனர் ஒப்புதல் & டேட்டாபேஸ் அமைப்பு' },
  totalBanners: { en: 'Total Banners', ta: 'மொத்த பேனர்கள்' },
  liveNow: { en: 'Live Now (Approved)', ta: 'நேரலையில் உள்ளது (ஒப்புதல் பெற்றது)' },
  scheduled: { en: 'Scheduled', ta: 'திட்டமிடப்பட்டது' },
  inactiveDraft: { en: 'Drafts / Inactive', ta: 'காத்திருப்பு / ஒப்புதல் பெறாதவை' },
  createBanner: { en: 'Create New Banner', ta: 'புதிய பேனர் உருவாக்கு' },
  editBanner: { en: 'Edit Banner', ta: 'பேனர் திருத்து' },
  deleteBanner: { en: 'Delete Banner', ta: 'பேனர் நீக்கு' },
  approvalStatus: { en: 'Website Approval (Active Status)', ta: 'வெப்சைட்டில் காண்பிக்க ஒப்புதல் (ஆக்டிவ் ஸ்டேட்டஸ்)' },
  approvalHelp: {
    en: 'Banner will NOT show on website until Admin approves and turns Active ON.',
    ta: 'அட்மின் இந்த சுவிட்சை ஆன் (ON) செய்யும் வரை பேனர் வெப்சைட்டில் பார்வையாளர்களுக்குக் காண்பிக்கப்படாது.',
  },
  testSliderBtn: { en: 'Test Offer Slider (Preview)', ta: 'ஸ்லைடரை சோதித்துப் பார் (Preview)' },
  workflowTitle: { en: 'Testing & Approval Workflow', ta: 'செயல்முறை: சோதித்துப் பார்த்து இணைத்தல்' },
  workflowDesc: {
    en: '1. Enter banner details. 2. Test in the live sandbox. 3. Turn Active ON to publish.',
    ta: '1. பேனர் விவரங்களை உள்ளிடுங்கள். 2. சோதித்துப் பாருங்கள். 3. திருப்தி அடைந்ததும் Active ON செய்து தளத்தில் இணையுங்கள்.',
  },

  // Tabs in Admin
  tabBanners: { en: 'Offer Banners', ta: 'சலுகை பேனர்கள்' },
  tabBookings: { en: 'Sales Orders & Bookings', ta: 'விற்பனை ஆர்டர்கள் & முன்பதிவுகள்' },
  tabLogins: { en: 'Admin Login History', ta: 'லாகின் பதிவு விவரங்கள்' },
};

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof dictionary) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ta'); // Default to Tamil as requested!

  useEffect(() => {
    const saved = localStorage.getItem('ce_lang');
    if (saved === 'ta' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('ce_lang', newLang);
  };

  const toggleLang = () => {
    const next = lang === 'ta' ? 'en' : 'ta';
    setLang(next);
  };

  const t = (key: keyof typeof dictionary): string => {
    const entry = dictionary[key];
    if (!entry) return String(key);
    return entry[lang] || entry.en || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
