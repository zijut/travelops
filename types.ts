
export enum JamaahStatus {
  INQUIRY = 'Inquiry',
  BOOKED = 'Booked',
  PAID = 'Paid',
  VISA_APPROVED = 'Visa Approved',
  DEPARTED = 'Departed',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
}

export enum PackageStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  SOLD_OUT = 'Sold Out',
}

export type UserRole = 'Travel Admin' | 'Super Admin' | 'Ops Staff' | 'Field Agent' | 'Jamaah' | 'User';

export interface Jamaah {
  id: string; // e.g. JMH001
  name: string;
  avatarUrl: string;
  package: string;
  departureDate: string;
  status: JamaahStatus;
  kloter: string; // Group
  phone?: string;
  email?: string;
  passportNumber?: string;
  passportExpiry?: string;
  ktpNumber?: string;
  birthDate?: string;
  gender?: 'L' | 'P';
  bloodType?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  hotelMakkah?: string;
  roomMakkah?: string;
  hotelMadinah?: string;
  roomMadinah?: string;
  roomType?: 'Quad' | 'Triple' | 'Double' | 'Single';
  busNumber?: string;
  busSeatNumber?: number;
  totalPrice?: number;
  paidAmount?: number;
  paymentStatus?: 'Lunas' | 'DP' | 'Belum Bayar';
  visaNumber?: string;
  visaIssueDate?: string;
  visaExpiryDate?: string;
  vaccineStatus?: 'Verified' | 'Pending' | 'Missing';
}

export interface Package {
  id: string;
  name: string;
  duration: number;
  price: number;
  airline: string;
  hotel: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  quota: number;
  booked: number;
  status: PackageStatus;
  departureDate?: string;
  returnDate?: string;
  description?: string;
  included?: string[];
  excluded?: string[];
}

export interface Reminder {
  id: number;
  title: string;
  description: string;
  jamaahName: string;
  dueDate: string;
}

export interface FinancialSummary {
  kloter: string;
  revenue: number;
  expense: number;
  profit: number;
}

export type TaskCategory = 'Pre-Departure' | 'In-Saudi' | 'Post-Return';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface OpsTask {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  completed: boolean;
  assignee: string;
  description?: string;
  priority: TaskPriority;
  subtasks?: SubTask[];
  kloter?: string;
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface UserPaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  receiptNumber: string;
  paymentMethod: string;
  proofUrl?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  location: string;
  activities: {
    time: string;
    title: string;
    description: string;
    icon?: string;
  }[];
  dressCode?: string;
  notes?: string;
}

export interface ManasikDoa {
  id: string;
  category: 'ihram' | 'thawaf' | 'sai' | 'tahallul' | 'ziarah' | 'harian';
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  audioUrl?: string;
  tips?: string;
}


