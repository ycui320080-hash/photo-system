import type { OrderStatus } from '../constants/order-status';
export interface Package {
  id: string;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  price: number;
  description: string;
  retouchCount: number;
  duration: number;
  bookingRequired: boolean;
  enabled: boolean;
  sort: number;
}
export interface BookingInput {
  packageId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  people: number;
  note: string;
  requestId: string;
}
export interface Photo {
  id: string;
  orderId: string;
  number: string;
  url: string;
  expiresAt: string;
  selected?: boolean;
  note?: string;
  favorite?: boolean;
}
export interface Order {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  name: string;
  phone: string;
  people: number;
  note: string;
  appointment: string;
  amount: number;
  paid: number;
  status: OrderStatus;
  pickupCode: string;
  createdAt: string;
  updatedAt: string;
  history: { status: OrderStatus; at: string }[];
  photos: Photo[];
  selectionLocked: boolean;
  retouchCount: number;
  revision?: string;
  confirmed?: boolean;
  delivery?: Photo[];
  internalNote?: string;
  print?: { size: string; quantity: number; paper: string; laminate: boolean };
}
export interface Session {
  token: string;
  role: 'owner' | 'staff' | 'customer';
}
export interface Settings {
  name: string;
  address: string;
  phone: string;
  hours: string;
  watermark: string;
  retentionDays: number;
  capacity: number;
  closedDates: string;
  previewQuality: number;
  latitude?: number;
  longitude?: number;
}
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
