import fs from 'node:fs';
import path from 'node:path';
import type { LoginLogItem, BookingOrderItem } from '../types/backend';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOGINS_FILE = path.join(DATA_DIR, 'login_logs.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------- LOGIN LOGS ----------------
export function getLoginLogs(): LoginLogItem[] {
  try {
    ensureDir();
    if (!fs.existsSync(LOGINS_FILE)) {
      // Seed with initial login audit log
      const initial: LoginLogItem[] = [
        {
          id: 1,
          email: 'admin@example.com',
          ip: '127.0.0.1',
          user_agent: 'Antigravity IDE Agent / Localhost',
          status: 'SUCCESS',
          message: 'Admin signed in successfully',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      fs.writeFileSync(LOGINS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(LOGINS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed reading login logs:', err);
    return [];
  }
}

export function recordLoginLog(entry: Omit<LoginLogItem, 'id' | 'created_at'>): LoginLogItem {
  const all = getLoginLogs();
  const nextId = all.length ? Math.max(...all.map((item) => item.id)) + 1 : 1;
  const newLog: LoginLogItem = {
    id: nextId,
    ...entry,
    created_at: new Date().toISOString(),
  };

  all.unshift(newLog);
  try {
    ensureDir();
    fs.writeFileSync(LOGINS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing login log:', err);
  }
  return newLog;
}

// ---------------- BOOKINGS & SALES ORDERS ----------------
export function getAllBookingOrders(): BookingOrderItem[] {
  try {
    ensureDir();
    if (!fs.existsSync(BOOKINGS_FILE)) {
      // Seed with initial booking orders
      const initial: BookingOrderItem[] = [
        {
          id: 101,
          customer_name: 'Karthik Raja',
          phone: '+91 98401 23456',
          pickup: 'Chennai',
          drop: 'Madurai',
          vehicle: 'Sedan (Dzire / Etios)',
          trip_type: 'One Way',
          date: '2026-10-02',
          time: '06:00',
          estimated_fare: 4999,
          offer_code: 'QT-CHM-2026-778',
          offer_price: 4999,
          status: 'Confirmed',
          source: 'Offer Slider',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          notes: 'Customer booked via Festive Special Offer popup.',
        },
        {
          id: 102,
          customer_name: 'Anand Kumar',
          phone: '+91 94432 87654',
          pickup: 'Trichy',
          drop: 'Chennai',
          vehicle: 'SUV (Ertiga)',
          trip_type: 'One Way',
          date: '2026-10-03',
          time: '14:30',
          estimated_fare: 3999,
          offer_code: 'QT-TRC-2026-902',
          offer_price: 3999,
          status: 'Pending',
          source: 'Offer Slider',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          notes: 'Customer awaiting driver assignment.',
        },
      ];
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed reading booking orders:', err);
    return [];
  }
}

export function createBookingOrder(orderData: Omit<BookingOrderItem, 'id' | 'created_at' | 'status'> & { status?: BookingOrderItem['status'] }): BookingOrderItem {
  const all = getAllBookingOrders();
  const nextId = all.length ? Math.max(...all.map((item) => item.id)) + 1 : 101;
  const newOrder: BookingOrderItem = {
    id: nextId,
    ...orderData,
    status: orderData.status || 'Pending',
    created_at: new Date().toISOString(),
  };

  all.unshift(newOrder);
  try {
    ensureDir();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing booking order:', err);
  }
  return newOrder;
}

export function updateBookingOrderStatus(id: number, status: BookingOrderItem['status']): BookingOrderItem | null {
  const all = getAllBookingOrders();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  all[index].status = status;
  try {
    ensureDir();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed updating booking order status:', err);
  }
  return all[index];
}
