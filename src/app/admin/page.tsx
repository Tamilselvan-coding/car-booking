'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  MapPin,
  CarFront,
  ArrowRight,
  Sparkles,
  LogOut,
  RotateCcw,
  AlertCircle,
  Clock,
  Layers,
  Check,
  X,
  ExternalLink,
  Users,
  ShoppingBag,
  History,
  Phone,
  User,
  Database,
  RefreshCw,
} from 'lucide-react';
import type { BannerItem, BannerFormData, BannerSummary } from '../../types/banner';
import type { LoginLogItem, BookingOrderItem } from '../../types/backend';
import { OfferSplashSlider } from '../../components/OfferSplashSlider';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import { BrandLogo } from '../../components/BrandLogo';

export default function AdminPage() {
  const { lang, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'banners' | 'bookings' | 'logins'>('banners');

  // Banner State
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [summary, setSummary] = useState<BannerSummary>({
    total: 0,
    live: 0,
    scheduled: 0,
    inactive: 0,
  });
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'scheduled' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState<BookingOrderItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<string>('all');

  // Login Logs State
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Form State (Create / Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    from_city: 'Chennai',
    to_city: 'Madurai',
    vehicle_type: 'Sedan (Dzire / Etios)',
    available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
    trip_type: 'One Way',
    actual_price: 6500,
    offer_price: 4999,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    quotation_ref: 'QT-CHM-' + new Date().getFullYear(),
    quotation_details: 'Includes toll allowance, ₹400 driver bata included, sanitized AC car, zero hidden charges.',
    banner_image: '/images/special-offer-banner.jpg',
    is_active: false, // Default is inactive until Admin approves!
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Test / Preview Sandbox State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTestBanner, setPreviewTestBanner] = useState<BannerItem | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Laravel Backend Connection State
  const [backendInfo, setBackendInfo] = useState<{
    connected: boolean;
    laravel_url: string;
    port: number;
    service: string;
    database: string;
    checking: boolean;
  }>({
    connected: false,
    laravel_url: 'http://127.0.0.1:8000/api',
    port: 8000,
    service: 'Laravel REST API',
    database: 'MySQL (car_booking)',
    checking: true,
  });

  const checkBackendStatus = async () => {
    setBackendInfo((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch('/api/backend/status', { cache: 'no-store' });
      const data = await res.json();
      setBackendInfo({
        connected: Boolean(data.connected),
        laravel_url: data.laravel_url || 'http://127.0.0.1:8000/api',
        port: data.port || 8000,
        service: data.service || 'Laravel REST API',
        database: data.database || 'MySQL (car_booking)',
        checking: false,
      });
    } catch {
      setBackendInfo((prev) => ({ ...prev, connected: false, checking: false }));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check auth session & backend connectivity
  useEffect(() => {
    const saved = localStorage.getItem('ce_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    checkBackendStatus();
  }, []);


  // Fetch Banners
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch('/api/banners');
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setBanners(json.data);
        if (json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  // Fetch Bookings & Orders
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings');
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setBookings(json.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Login Logs
  const fetchLoginLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logins');
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setLoginLogs(json.data);
      }
    } catch (err) {
      console.error('Failed to load login logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBanners();
      fetchBookings();
      fetchLoginLogs();
    }
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.status) {
        localStorage.setItem('ce_admin_auth', 'true');
        setIsAuthenticated(true);
        showToast(lang === 'ta' ? 'அட்மின் லாகின் வெற்றி! (டேட்டாபேஸில் சேமிக்கப்பட்டது)' : 'Admin login successful! Saved in database.');
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch {
      setLoginError('Login request failed. Please check network.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    localStorage.removeItem('ce_admin_auth');
    setIsAuthenticated(false);
    showToast(lang === 'ta' ? 'வெற்றிகரமாக வெளியேறியது.' : 'Logged out successfully.');
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingBanner(null);
    const today = new Date().toISOString().slice(0, 10);
    const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    setFormData({
      title: 'Chennai to Madurai Special Drop',
      from_city: 'Chennai',
      to_city: 'Madurai',
      vehicle_type: 'Sedan (Dzire / Etios)',
      available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
      trip_type: 'One Way',
      actual_price: 6800,
      offer_price: 4999,
      from_date: today,
      to_date: twoWeeks,
      quotation_ref: 'QT-CHM-' + Math.floor(100 + Math.random() * 900),
      quotation_details: 'Includes toll allowance, ₹400 driver bata, AC ride, zero surge.',
      banner_image: '/images/special-offer-banner.jpg',
      is_active: false, // Default inactive awaiting admin approval!
    });
    setFormError('');
    setIsEditorOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      from_city: banner.from_city,
      to_city: banner.to_city,
      vehicle_type: banner.vehicle_type,
      available_vehicles: banner.available_vehicles || ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
      trip_type: banner.trip_type,
      actual_price: banner.actual_price,
      offer_price: banner.offer_price,
      from_date: banner.from_date,
      to_date: banner.to_date,
      quotation_ref: banner.quotation_ref,
      quotation_details: banner.quotation_details,
      banner_image: banner.banner_image,
      is_active: banner.is_active,
    });
    setFormError('');
    setIsEditorOpen(true);
  };

  // Save Form (Create / Update in Backend Database)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (Number(formData.offer_price) > Number(formData.actual_price)) {
      setFormError(lang === 'ta' ? 'தள்ளுபடி விலை வழக்கமான விலையை விட குறைவாக இருக்க வேண்டும்.' : 'Offer price must be less than or equal to actual price.');
      return;
    }
    if (formData.to_date < formData.from_date) {
      setFormError(lang === 'ta' ? 'முடிவு தேதி தொடக்க தேதிக்கு சமமாக அல்லது பின் இருக்க வேண்டும்.' : 'To Date must be on or after From Date.');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        // Update
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.status) {
          showToast(lang === 'ta' ? 'பேனர் டேட்டாபேஸில் புதுப்பிக்கப்பட்டது!' : 'Banner updated in backend database!');
          setIsEditorOpen(false);
          fetchBanners();
        } else {
          setFormError(json.message || 'Failed to update banner');
        }
      } else {
        // Create
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.status) {
          showToast(
            formData.is_active
              ? (lang === 'ta' ? 'பேனர் உருவாக்கப்பட்டு ஒப்புதல் அளிக்கப்பட்டது (Live)!' : 'Banner created & approved (Live)!')
              : (lang === 'ta' ? 'பேனர் காத்திருப்பில் டேட்டாபேஸில் சேமிக்கப்பட்டது (Draft)' : 'Banner saved as Draft (Inactive)')
          );
          setIsEditorOpen(false);
          fetchBanners();
        } else {
          setFormError(json.message || 'Failed to create banner');
        }
      }
    } catch {
      setFormError('Network request failed.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status (Admin Approval in Backend Database)
  const handleToggleStatus = async (banner: BannerItem) => {
    const nextStatus = !banner.is_active;
    try {
      const res = await fetch(`/api/banners/${banner.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      const json = await res.json();
      if (json.status) {
        showToast(
          nextStatus
            ? (lang === 'ta' ? `பேனர் #${banner.id} ஒப்புதல் அளிக்கப்பட்டு ஆன் செய்யப்பட்டது! தளத்தில் தோன்றும்.` : `Banner #${banner.id} Approved & Activated! Showing on website.`)
            : (lang === 'ta' ? `பேனர் #${banner.id} முடக்கப்பட்டது (தளத்திலிருந்து மறைக்கப்பட்டது).` : `Banner #${banner.id} Deactivated. Hidden from website.`)
        );
        fetchBanners();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete Banner
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(lang === 'ta' ? `நிச்சயமாக பேனர் "${title}" நீக்க வேண்டுமா?` : `Are you sure you want to delete banner "${title}"?`)) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) {
        showToast(lang === 'ta' ? 'பேனர் டேட்டாபேஸிலிருந்து நீக்கப்பட்டது.' : 'Banner deleted from backend database.');
        fetchBanners();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (id: number, newStatus: BookingOrderItem['status']) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.status) {
        showToast(lang === 'ta' ? `ஆர்டர் #${id} நிலை மாற்றப்பட்டது: ${newStatus}` : `Order #${id} status updated to: ${newStatus}`);
        fetchBookings();
      }
    } catch (err) {
      console.error('Failed updating booking status:', err);
    }
  };

  // Filtered banners
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.title.toLowerCase().includes(q) ||
          b.from_city.toLowerCase().includes(q) ||
          b.to_city.toLowerCase().includes(q) ||
          b.quotation_ref.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter === 'active') {
        return b.is_active && b.from_date <= todayStr && b.to_date >= todayStr;
      }
      if (statusFilter === 'inactive') {
        return !b.is_active;
      }
      if (statusFilter === 'scheduled') {
        return b.is_active && b.from_date > todayStr;
      }
      if (statusFilter === 'expired') {
        return b.is_active && b.to_date < todayStr;
      }
      return true;
    });
  }, [banners, searchQuery, statusFilter, todayStr]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => b.status.toLowerCase() === bookingFilter.toLowerCase());
  }, [bookings, bookingFilter]);

  const getStatusBadge = (banner: BannerItem) => {
    if (!banner.is_active) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-300 border border-zinc-700">
          <XCircle className="h-3 w-3 text-zinc-400" /> {lang === 'ta' ? 'காத்திருப்பு (Draft)' : 'Inactive'}
        </span>
      );
    }
    if (banner.from_date > todayStr) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
          <Clock className="h-3 w-3 text-amber-400" /> {lang === 'ta' ? 'வரவிருக்கும் (Scheduled)' : 'Scheduled'}
        </span>
      );
    }
    if (banner.to_date < todayStr) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 border border-red-500/30">
          <AlertCircle className="h-3 w-3 text-red-400" /> {lang === 'ta' ? 'முடிந்தது (Expired)' : 'Expired'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {lang === 'ta' ? 'தளத்தில் நேரலையில் (Live)' : 'Live on Website'}
      </span>
    );
  };

  // If loading session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 gap-2">
            <BrandLogo variant="dark" size="sm" />
            <LanguageToggle />
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <strong>{lang === 'ta' ? 'Laravel பேக்கெண்ட் ஏபிஐ & MySQL:' : 'Laravel Backend REST API & MySQL:'}</strong>
                  {backendInfo.connected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Port 8000
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                      Local DB
                    </span>
                  )}
                </div>
                <p className="mt-1 text-zinc-300">
                  {lang === 'ta'
                    ? 'Laravel REST API (http://127.0.0.1:8000/api) மற்றும் MySQL `car_booking` டேட்டாபேஸுடன் நேரலையாக இணைக்கப்பட்டுள்ளது. அட்மின் லாகின்கள், பேனர்கள் மற்றும் ஆர்டர்கள் அனைத்தும் சேமிக்கப்படும்.'
                    : 'Directly linked to Laravel REST API (http://127.0.0.1:8000/api) & MySQL `car_booking` database. All admin logins, banners, and bookings are securely stored.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {loginError && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                {lang === 'ta' ? 'அட்மின் மின்னஞ்சல் (Admin Email)' : 'Admin Email'}
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                {lang === 'ta' ? 'கடவுச்சொல் (Password)' : 'Password'}
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="shine-button mt-2 flex w-full h-12 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loggingIn ? (lang === 'ta' ? 'உள்நுழைகிறது...' : 'Signing In...') : (lang === 'ta' ? 'உள்நுழைக (Sign In)' : 'Sign In to Workspace')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400">
            <Link href="/" className="hover:text-amber-400 transition">
              {lang === 'ta' ? '← முகப்புப் பக்கத்திற்குச் செல்க' : '← Return to Website'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] rounded-xl border border-amber-400/40 bg-zinc-900 px-5 py-3 text-sm font-black text-amber-300 shadow-2xl animate-in slide-in-from-top-3">
          ✓ {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-zinc-900/80 px-4 py-4 sm:px-8 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="dark" size="sm" />
            <span className="hidden md:inline-flex rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 text-[10px] font-black uppercase text-amber-300">
              {lang === 'ta' ? 'அட்மின் போர்ட்டல்' : 'Admin Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> {lang === 'ta' ? 'தளத்தைப் பார்' : 'View Site'}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> {lang === 'ta' ? 'வெளியேறு' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                activeTab === 'banners'
                  ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{lang === 'ta' ? 'சலுகை பேனர்கள் (Banners)' : 'Offer Banners'}</span>
              <span className="rounded-full bg-zinc-950/20 px-2 py-0.5 text-xs">
                {banners.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                activeTab === 'bookings'
                  ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{lang === 'ta' ? 'முன்பதிவு ஆர்டர்கள் (Bookings)' : 'Sales Orders & Bookings'}</span>
              <span className="rounded-full bg-zinc-950/20 px-2 py-0.5 text-xs">
                {bookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logins')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                activeTab === 'logins'
                  ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <History className="h-4 w-4" />
              <span>{lang === 'ta' ? 'லாகின் வரலாறு (Login Logs)' : 'Login History'}</span>
              <span className="rounded-full bg-zinc-950/20 px-2 py-0.5 text-xs">
                {loginLogs.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await checkBackendStatus();
                await fetchBanners();
                await fetchBookings();
                await fetchLoginLogs();
                showToast(lang === 'ta' ? 'டேட்டாபேஸ் புதுப்பிக்கப்பட்டது' : 'Refreshed from database');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition"
              title="Refresh database records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${backendInfo.checking ? 'animate-spin' : ''}`} /> {lang === 'ta' ? 'புதுப்பி' : 'Sync'}
            </button>
          </div>
        </div>

        {/* Laravel Backend REST API Integration Banner */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  backendInfo.connected
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {lang === 'ta' ? 'Laravel பேக்கெண்ட் ஏபிஐ (REST API):' : 'Laravel Backend REST API:'}
                  </span>
                  {backendInfo.connected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      {lang === 'ta' ? 'இணைக்கப்பட்டுள்ளது (Connected Port 8000)' : 'Connected (Port 8000)'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-500/30">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      {lang === 'ta' ? 'லோக்கல் பேக்கப் (Local DB)' : 'Local Fallback'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  <span className="text-zinc-200 font-mono font-medium">{backendInfo.laravel_url}</span> •{' '}
                  <span className="text-amber-400/90 font-medium">MySQL DB: car_booking</span> •{' '}
                  {lang === 'ta'
                    ? 'சலுகை பேனர்கள், ஆர்டர்கள் மற்றும் அட்மின் லாகின் விவரங்கள் அனைத்தும் நேரலையாக சேமிக்கப்படுகின்றன'
                    : 'All offer banners, bookings and admin login records are synced in MySQL database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await checkBackendStatus();
                  await fetchBanners();
                  await fetchBookings();
                  await fetchLoginLogs();
                  showToast(lang === 'ta' ? 'Laravel ஏபிஐ நிலை புதுப்பிக்கப்பட்டது!' : 'Laravel API ping checked!');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${backendInfo.checking ? 'animate-spin' : ''}`} />
                <span>{lang === 'ta' ? 'ஏபிஐ பிங் சோதனை' : 'Test Laravel API Ping'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: BANNERS MANAGEMENT */}
        {activeTab === 'banners' && (
          <div>
            {/* Banner Summary Stats */}
            <section aria-label="Statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                <span className="text-xs font-bold uppercase text-zinc-400">{t('totalBanners')}</span>
                <p className="mt-2 text-3xl font-black text-white">{summary.total}</p>
                <span className="text-[11px] text-zinc-500">
                  {lang === 'ta' ? 'டேட்டாபேஸில் உள்ளவை' : 'Stored in database'}
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5">
                <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" /> {t('liveNow')}
                </span>
                <p className="mt-2 text-3xl font-black text-emerald-400">{summary.live}</p>
                <span className="text-[11px] text-emerald-500">
                  {lang === 'ta' ? 'வெப்சைட்டில் பார்வையாளர்களுக்கு தெரிகிறது' : 'Visible to website visitors'}
                </span>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5">
                <span className="text-xs font-bold uppercase text-amber-400">{t('scheduled')}</span>
                <p className="mt-2 text-3xl font-black text-amber-400">{summary.scheduled}</p>
                <span className="text-[11px] text-amber-500">
                  {lang === 'ta' ? 'எதிர்கால தேதிக்காக தயார்' : 'Ready for future date'}
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5">
                <span className="text-xs font-bold uppercase text-zinc-400">{t('inactiveDraft')}</span>
                <p className="mt-2 text-3xl font-black text-zinc-300">{summary.inactive}</p>
                <span className="text-[11px] text-zinc-500">
                  {lang === 'ta' ? 'அட்மின் ஒப்புதலுக்காக காத்திருப்பு' : 'Awaiting Admin Approval'}
                </span>
              </div>
            </section>

            {/* Action & Filter Toolbar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                    statusFilter === 'all'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {lang === 'ta' ? 'அனைத்து பேனர்கள்' : 'All Banners'} ({banners.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                    statusFilter === 'active'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {lang === 'ta' ? 'நேரலை ஒப்புதல்' : 'Live Approved'} ({summary.live})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                    statusFilter === 'inactive'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {lang === 'ta' ? 'காத்திருப்பில் உள்ளவை' : 'Drafts / Inactive'} ({summary.inactive})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ta' ? 'வழித்தடம், ஊர், ஆர்டர் தேடவும்...' : 'Search route, city, quote...'}
                    className="w-48 sm:w-64 rounded-xl border border-white/10 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="shine-button flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-300"
                >
                  <Plus className="h-4 w-4" /> {t('createBanner')}
                </button>
              </div>
            </div>

            {/* Workflow Guidance Card */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    {t('workflowTitle')}
                  </span>
                  <h3 className="mt-1 text-base font-black text-white">
                    {lang === 'ta' ? 'விவரங்களைக் கொடுத்து சோதித்துப் பார்த்துவிட்டு, பிறகு ஸ்லைடரில் இணைக்கலாம்:' : 'Test before publishing to slider:'}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-300 leading-relaxed max-w-2xl">
                    {t('workflowDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = banners.find((b) => b.is_active) || banners[0];
                    if (sample) {
                      setPreviewTestBanner(sample);
                      setPreviewModalOpen(true);
                    } else {
                      showToast(lang === 'ta' ? 'முதலில் ஒரு பேனரை உருவாக்கவும்!' : 'Create a banner first to test!');
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs font-black text-amber-300 hover:bg-amber-400/20 transition shrink-0"
                >
                  <Eye className="h-4 w-4" /> {t('testSliderBtn')}
                </button>
              </div>
            </div>

            {/* Banners Table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              {loadingBanners ? (
                <div className="p-12 text-center text-zinc-400">Loading banners from database...</div>
              ) : filteredBanners.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-base font-bold text-zinc-300">No banners found</p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-zinc-950"
                  >
                    <Plus className="h-4 w-4" /> {t('createBanner')}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-800/80 text-zinc-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Banner Image & Title</th>
                        <th className="px-4 py-3.5">{t('routeDetails')}</th>
                        <th className="px-4 py-3.5">{t('offerPrice')}</th>
                        <th className="px-4 py-3.5">{t('validityPeriod')}</th>
                        <th className="px-4 py-3.5">Order Ref</th>
                        <th className="px-4 py-3.5 text-center">Admin Approval (ஆன் / ஆஃப்)</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBanners.map((banner) => {
                        const actual = Number(banner.actual_price);
                        const offer = Number(banner.offer_price);
                        const discount = actual > 0 ? Math.round(((actual - offer) / actual) * 100) : 0;

                        return (
                          <tr key={banner.id} className="hover:bg-white/[0.02] transition">
                            {/* Image & Title */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={banner.banner_image || '/images/special-offer-banner.jpg'}
                                  alt=""
                                  className="h-12 w-20 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                                <div>
                                  <strong className="block text-sm font-black text-white">
                                    {banner.title}
                                  </strong>
                                  <span className="text-[11px] text-zinc-400">
                                    {banner.vehicle_type} · {banner.trip_type}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Route */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                                <span className="text-emerald-400 font-black">{banner.from_city}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                                <span className="text-amber-400 font-black">{banner.to_city}</span>
                              </div>
                            </td>

                            {/* Pricing */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-baseline gap-2">
                                <strong className="text-sm font-black text-amber-400">
                                  ₹{offer.toLocaleString('en-IN')}
                                </strong>
                                <del className="text-zinc-500">₹{actual.toLocaleString('en-IN')}</del>
                              </div>
                              {discount > 0 && (
                                <span className="mt-0.5 inline-block rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-black text-amber-300">
                                  {discount}% OFF
                                </span>
                              )}
                            </td>

                            {/* Dates & Status */}
                            <td className="px-4 py-3.5">
                              <div className="text-zinc-300 font-medium">
                                <span>{banner.from_date}</span>
                                <span className="text-zinc-500 mx-1">to</span>
                                <span>{banner.to_date}</span>
                              </div>
                              <div className="mt-1">{getStatusBadge(banner)}</div>
                            </td>

                            {/* Quotation Ref */}
                            <td className="px-4 py-3.5">
                              <span className="font-mono text-xs font-bold text-amber-200 bg-zinc-800 px-2 py-0.5 rounded border border-white/5">
                                {banner.quotation_ref}
                              </span>
                            </td>

                            {/* Active Approval Switch */}
                            <td className="px-4 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(banner)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition ${
                                  banner.is_active
                                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-white/10'
                                }`}
                                title={banner.is_active ? 'Click to deactivate' : 'Click to approve & activate'}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    banner.is_active ? 'bg-zinc-950 animate-pulse' : 'bg-zinc-500'
                                  }`}
                                />
                                {banner.is_active ? 'Active ON' : 'Draft OFF'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewTestBanner(banner);
                                    setPreviewModalOpen(true);
                                  }}
                                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-amber-400 transition"
                                  title="Test / Preview Slider"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(banner)}
                                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                                  title="Edit Banner"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(banner.id, banner.title)}
                                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition"
                                  title="Delete Banner"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS & SALES ORDERS SAVED IN BACKEND */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">
                  {lang === 'ta' ? 'டேட்டாபேஸில் சேமிக்கப்பட்ட முன்பதிவுகள்' : 'Customer Bookings & Quotation Orders'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === 'ta'
                    ? 'சலுகை ஸ்லைடர் மற்றும் வெப்சைட் மூலம் வாடிக்கையாளர்கள் பதிவு செய்த விவரங்கள் பேக்கெண்ட் டேட்டாபேஸில் சேமிக்கப்பட்டுள்ளன.'
                    : 'Real booking records submitted by customers claiming offers and estimating fares.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['all', 'pending', 'confirmed', 'completed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setBookingFilter(status)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase transition ${
                      bookingFilter === status
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loadingBookings ? (
              <div className="p-12 text-center text-zinc-400">Loading bookings from database...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-white/10">
                <p className="text-zinc-300 font-bold">No bookings found for this filter.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-800/80 text-zinc-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Order ID & Date</th>
                        <th className="px-4 py-3.5">Customer & Phone</th>
                        <th className="px-4 py-3.5">Route & Ride</th>
                        <th className="px-4 py-3.5">Estimated Fare / Offer</th>
                        <th className="px-4 py-3.5">Source / Ref</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition">
                          {/* ID & Date */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-black text-amber-400 text-sm">
                              #{order.id}
                            </span>
                            <div className="text-[11px] text-zinc-500">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-zinc-400 shrink-0" />
                              <div>
                                <strong className="block text-white text-sm">{order.customer_name}</strong>
                                <a
                                  href={`tel:${order.phone}`}
                                  className="text-[11px] text-teal-400 font-bold hover:underline"
                                >
                                  {order.phone}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Route */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 text-sm font-black">
                              <span className="text-emerald-400">{order.pickup}</span>
                              <ArrowRight className="h-3 w-3 text-zinc-500" />
                              <span className="text-amber-400">{order.drop}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {order.vehicle} · {order.trip_type}
                            </div>
                          </td>

                          {/* Fare */}
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-black text-white">
                              ₹{order.estimated_fare.toLocaleString('en-IN')}
                            </span>
                            {order.offer_price && (
                              <div className="text-[11px] text-amber-300 font-bold">
                                Deal Applied
                              </div>
                            )}
                          </td>

                          {/* Source */}
                          <td className="px-4 py-3.5">
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-zinc-300 border border-white/5">
                              {order.source}
                            </span>
                            {order.offer_code && (
                              <div className="font-mono text-[10px] text-amber-400 mt-1">
                                {order.offer_code}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                                order.status === 'Confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : order.status === 'Completed'
                                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {order.status !== 'Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(order.id, 'Confirmed')}
                                  className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                >
                                  Confirm
                                </button>
                              )}
                              {order.status !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(order.id, 'Completed')}
                                  className="rounded-lg bg-teal-500/10 px-2.5 py-1 text-[11px] font-bold text-teal-400 hover:bg-teal-500/20 border border-teal-500/20"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN LOGIN AUDIT LOGS SAVED IN BACKEND */}
        {activeTab === 'logins' && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">
                  {lang === 'ta' ? 'அட்மின் லாகின் பதிவு விவரங்கள் (Login History)' : 'Admin Login Security Audit Logs'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === 'ta'
                    ? 'அட்மின் உள்நுழைந்த நேரம், மின்னஞ்சல், IP முகவரி மற்றும் நிலை டேட்டாபேஸில் பதிவு செய்யப்படுகிறது.'
                    : 'Every admin login attempt (success/failure) is audited and saved in the backend database.'}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{loginLogs.filter((l) => l.status === 'SUCCESS').length} Successful Logins</span>
              </div>
            </div>

            {loadingLogs ? (
              <div className="p-12 text-center text-zinc-400">Loading login history from database...</div>
            ) : loginLogs.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-white/10">
                <p className="text-zinc-300 font-bold">No login logs found.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-800/80 text-zinc-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Log ID</th>
                        <th className="px-4 py-3.5">Admin Email</th>
                        <th className="px-4 py-3.5">Date & Time</th>
                        <th className="px-4 py-3.5">IP Address</th>
                        <th className="px-4 py-3.5">Device / Agent</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loginLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition">
                          <td className="px-4 py-3.5 font-mono text-zinc-400">#{log.id}</td>
                          <td className="px-4 py-3.5 font-bold text-white">{log.email}</td>
                          <td className="px-4 py-3.5 text-zinc-300">
                            {new Date(log.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-amber-300">{log.ip}</td>
                          <td className="px-4 py-3.5 text-zinc-400 max-w-xs truncate" title={log.user_agent}>
                            {log.user_agent}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {log.status === 'SUCCESS' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE / EDIT DRAWER MODAL */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-400">Offer Studio</span>
                <h2 className="text-xl font-black">
                  {editingBanner ? `Edit Banner #${editingBanner.id}` : t('createBanner')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="mt-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Banner Title / Campaign Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chennai to Madurai Festive Special Drop"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Starting & Destination Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    {t('startLocation')} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.from_city}
                    onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                    placeholder="e.g. Chennai"
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setFormData({ ...formData, from_city: city })}
                        className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    {t('destLocation')} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.to_city}
                    onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                    placeholder="e.g. Madurai"
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {['Madurai', 'Trichy', 'Chennai', 'Coimbatore', 'Bangalore'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setFormData({ ...formData, to_city: city })}
                        className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle Type & Trip Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    {t('selectVehicle')}
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Sedan (Dzire / Etios)">Sedan (Dzire / Etios - 4 Seats)</option>
                    <option value="SUV (Ertiga)">SUV (Ertiga - 6 Seats)</option>
                    <option value="Innova Crysta">Innova Crysta (7 Seats)</option>
                    <option value="Tempo Traveller">Tempo Traveller (12+ Seats)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Trip Type (பயண வகை)
                  </label>
                  <select
                    value={formData.trip_type}
                    onChange={(e) => setFormData({ ...formData, trip_type: e.target.value as 'One Way' | 'Round Trip' })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="One Way">One Way Drop Taxi</option>
                    <option value="Round Trip">Round Trip</option>
                  </select>
                </div>
              </div>

              {/* Pricing (Actual & Offer Price) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-white/10 bg-zinc-800/40 p-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    {t('actualPrice')} <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={formData.actual_price}
                      onChange={(e) => setFormData({ ...formData, actual_price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                    {t('offerPrice')} <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={formData.offer_price}
                      onChange={(e) => setFormData({ ...formData, offer_price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-amber-400/50 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Savings Feedback */}
                {formData.actual_price > formData.offer_price && (
                  <div className="sm:col-span-2 text-xs font-bold text-emerald-400 flex items-center justify-between">
                    <span>Discount Savings: ₹{(formData.actual_price - formData.offer_price).toLocaleString('en-IN')}</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5">
                      {Math.round(((formData.actual_price - formData.offer_price) / formData.actual_price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Offer Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    From Date (எப்போது முதல்) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    To Date (எப்போது வரை) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quotation / Sales Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    {t('quotationRef')}
                  </label>
                  <input
                    type="text"
                    value={formData.quotation_ref}
                    onChange={(e) => setFormData({ ...formData, quotation_ref: e.target.value })}
                    placeholder="e.g. QT-CHM-2026-778"
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Banner Image Preset
                  </label>
                  <select
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="/images/special-offer-banner.jpg">Golden Sunset Coastal Taxi (Featured)</option>
                    <option value="/images/destination-chennai.png">Chennai Central Scenery</option>
                    <option value="/images/destination-madurai.png">Madurai Temple City Scenery</option>
                    <option value="/images/destination-trichy.png">Trichy Rockfort Scenery</option>
                    <option value="/images/destination-coimbatore.png">Coimbatore Hills Scenery</option>
                    <option value="/images/outstation-taxi.png">Highway Outstation Taxi</option>
                  </select>
                </div>
              </div>

              {/* Quotation Inclusions / Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  {t('quotationTerms')}
                </label>
                <textarea
                  rows={2}
                  value={formData.quotation_details}
                  onChange={(e) => setFormData({ ...formData, quotation_details: e.target.value })}
                  placeholder="Includes toll allowance, ₹400 driver bata, AC ride, zero surge."
                  className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* ADMIN APPROVAL SWITCH */}
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block text-sm font-black text-amber-300">
                      {t('approvalStatus')}
                    </strong>
                    <p className="mt-0.5 text-xs text-zinc-300">
                      {formData.is_active
                        ? (lang === 'ta' ? 'Approved (ON): இந்த பேனர் வெப்சைட்டில் பார்வையாளர்களுக்கு உடனடியாகக் காண்பிக்கப்படும்.' : 'Approved (ON): Banner will be immediately shown to visitors.')
                        : (lang === 'ta' ? 'Draft (OFF): அட்மின் ஒப்புதல் ஆன் செய்யும் வரை வெப்சைட்டில் காண்பிக்கப்படாது.' : 'Draft (OFF): Hidden from website until Admin approves.')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="shine-button flex items-center gap-1.5 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {saving ? (lang === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : editingBanner ? (lang === 'ta' ? 'புதுப்பி' : 'Update Banner') : (lang === 'ta' ? 'உருவாக்கு' : 'Create Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST / PREVIEW SANDBOX MODAL */}
      {previewModalOpen && previewTestBanner && (
        <OfferSplashSlider
          forceOpen={true}
          previewBanners={[previewTestBanner]}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}
