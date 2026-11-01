-- ====================================================================
-- CHETTINAD EXPRESS CAR BOOKING - SUPABASE DATABASE SCHEMA & POLICIES
-- ====================================================================
-- How to apply this schema:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Open your Project -> Click on "SQL Editor" on the left menu
-- 3. Click "New Query", paste this entire SQL script and click "RUN"
-- ====================================================================

-- 1. BOOKINGS & SALES QUOTATION ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    pickup TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    trip_type TEXT NOT NULL,
    booking_date TEXT,
    booking_time TEXT,
    estimated_fare NUMERIC(12, 2) DEFAULT 0.00,
    offer_code TEXT,
    offer_price NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'Pending',
    source TEXT NOT NULL DEFAULT 'Direct Booking',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SPECIAL OFFER BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    from_city TEXT NOT NULL DEFAULT 'Chennai',
    to_city TEXT NOT NULL DEFAULT 'Madurai',
    vehicle_type TEXT NOT NULL DEFAULT 'Sedan (Dzire / Etios)',
    available_vehicles JSONB DEFAULT '["Sedan (Dzire / Etios)", "SUV (Ertiga)", "Innova Crysta"]'::jsonb,
    trip_type TEXT NOT NULL DEFAULT 'One Way',
    banner_image TEXT NOT NULL DEFAULT '/images/special-offer-banner.jpg',
    actual_price NUMERIC(12, 2) NOT NULL,
    offer_price NUMERIC(12, 2) NOT NULL,
    from_date DATE NOT NULL DEFAULT CURRENT_DATE,
    to_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    quotation_ref TEXT NOT NULL DEFAULT 'QT-SPECIAL',
    quotation_details TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOGIN & SECURITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.login_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL,
    ip TEXT DEFAULT 'Direct Browser Client',
    user_agent TEXT,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables direct Frontend JavaScript calls to save bookings and view banners
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if they exist (clean reload)
DROP POLICY IF EXISTS "Allow public booking creation" ON public.bookings;
DROP POLICY IF EXISTS "Allow reading bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow updating bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow reading active banners" ON public.banners;
DROP POLICY IF EXISTS "Allow all banner management" ON public.banners;
DROP POLICY IF EXISTS "Allow inserting login logs" ON public.login_logs;
DROP POLICY IF EXISTS "Allow reading login logs" ON public.login_logs;

-- BOOKINGS POLICIES:
-- Customers can submit bookings from frontend
CREATE POLICY "Allow public booking creation" 
ON public.bookings FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow reading bookings (for Admin Dashboard)
CREATE POLICY "Allow reading bookings" 
ON public.bookings FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow updating booking status (for Admin Dashboard)
CREATE POLICY "Allow updating bookings" 
ON public.bookings FOR UPDATE 
TO anon, authenticated 
USING (true);

-- BANNERS POLICIES:
-- Allow viewing banners on frontend and admin
CREATE POLICY "Allow all banner management" 
ON public.banners FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- LOGIN LOGS POLICIES:
-- Allow inserting audit logs
CREATE POLICY "Allow inserting login logs" 
ON public.login_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow viewing audit logs in admin
CREATE POLICY "Allow reading login logs" 
ON public.login_logs FOR SELECT 
TO anon, authenticated 
USING (true);

-- ====================================================================
-- SEED INITIAL DATA (Banners & Sample Bookings)
-- ====================================================================

INSERT INTO public.banners 
(title, from_city, to_city, vehicle_type, available_vehicles, trip_type, banner_image, actual_price, offer_price, from_date, to_date, quotation_ref, quotation_details, is_active)
VALUES
(
    'Chennai to Madurai Special Drop Fare',
    'Chennai',
    'Madurai',
    'Sedan (Dzire / Etios)',
    '["Sedan (Dzire / Etios)", "SUV (Ertiga)", "Innova Crysta"]'::jsonb,
    'One Way',
    '/images/special-offer-banner.jpg',
    6500.00,
    4999.00,
    CURRENT_DATE,
    (CURRENT_DATE + INTERVAL '14 days'),
    'QT-CHM-2026',
    'All-inclusive one-way drop taxi fare with driver bata and toll allowance.',
    true
),
(
    'Coimbatore to Ooty Hill Station Tour Offer',
    'Coimbatore',
    'Ooty',
    'SUV (Ertiga)',
    '["Sedan (Dzire / Etios)", "SUV (Ertiga)", "Innova Crysta"]'::jsonb,
    'Round Trip',
    '/images/special-offer-banner.jpg',
    5200.00,
    3899.00,
    CURRENT_DATE,
    (CURRENT_DATE + INTERVAL '30 days'),
    'QT-CBE-OOTY',
    'Includes hill permit, fuel, toll, and experienced ghat driver.',
    true
),
(
    'Bangalore to Chennai Executive Highway Ride',
    'Bangalore',
    'Chennai',
    'Innova Crysta',
    '["Sedan (Dzire / Etios)", "SUV (Ertiga)", "Innova Crysta"]'::jsonb,
    'One Way',
    '/images/special-offer-banner.jpg',
    7800.00,
    6200.00,
    CURRENT_DATE,
    (CURRENT_DATE + INTERVAL '14 days'),
    'QT-BLR-CHN',
    'Doorstep pickup, highway expressway route, free waiting 30 mins.',
    false
)
ON CONFLICT DO NOTHING;

INSERT INTO public.bookings 
(customer_name, phone, pickup, drop_location, vehicle, trip_type, booking_date, booking_time, estimated_fare, offer_code, offer_price, status, source, notes)
VALUES
(
    'Karthik Raja',
    '+91 98401 23456',
    'Chennai',
    'Madurai',
    'Sedan (Dzire / Etios)',
    'One Way',
    CURRENT_DATE::text,
    '06:00',
    4999.00,
    'QT-CHM-2026-778',
    4999.00,
    'Confirmed',
    'Offer Slider',
    'Customer booked via Festive Special Offer popup.'
)
ON CONFLICT DO NOTHING;
