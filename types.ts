
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

export interface Jamaah {
  id: string;
  name: string;
  avatarUrl: string;
  package: string;
  departureDate: string;
  status: JamaahStatus;
  kloter: string; // Group
}

export interface Package {
  id: string;
  name: string;
  duration: number;
  price: number;
  airline: string;
  hotel: string;
  quota: number;
  booked: number;
  status: PackageStatus;
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
}
