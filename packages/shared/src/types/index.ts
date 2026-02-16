// Tipos compartidos entre cliente y servidor

// ==================== ENUMS ====================

export enum HomeRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum SplitMode {
  EQUAL = 'EQUAL',
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNTS = 'FIXED_AMOUNTS',
  BY_ROOM = 'BY_ROOM',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum TaskFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ShoppingItemStatus {
  PENDING = 'PENDING',
  BOUGHT = 'BOUGHT',
  CANCELLED = 'CANCELLED',
}

export enum AnnouncementType {
  INFO = 'INFO',
  POLL = 'POLL',
  VOTE = 'VOTE',
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

// ==================== INTERFACES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Home {
  id: string;
  name: string;
  description?: string;
  address?: string;
  inviteCode: string;
  currency: string;
  defaultSplitMode: SplitMode;
  taskRotationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  myRole?: string;
  memberCount?: number;
}

export interface HomeMember {
  id: string;
  userId: string;
  homeId: string;
  role: HomeRole;
  nickname?: string;
  roomCost?: number;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
  user?: User;
  name?: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  homeId: string;
}

export interface Expense {
  id: string;
  homeId: string;
  paidById: string;
  amount: number;
  description: string;
  categoryId?: string;
  splitMode: SplitMode;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: Date;
  updatedAt: Date;
  paidBy?: User;
  category?: Category;
  participants?: ExpenseParticipant[];
}

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  userId: string;
  share: number;
  user?: User;
}

export interface Task {
  id: string;
  homeId: string;
  name: string;
  description?: string;
  frequency: TaskFrequency;
  difficulty: number;
  isActive: boolean;
  createdAt: Date;
  assignments?: TaskAssignment[];
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  assignedToId: string;
  dueDate: Date;
  status: TaskStatus;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  assignedTo?: User;
}

export interface ShoppingItem {
  id: string;
  homeId: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  status: ShoppingItemStatus;
  addedById: string;
  boughtById?: string;
  price?: number;
  store?: string;
  createdAt: Date;
  boughtAt?: Date;
  addedBy?: User;
  boughtBy?: User;
}

export interface Announcement {
  id: string;
  homeId: string;
  authorId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isPinned: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  options: string[];
  quorum?: number;
  author?: User;
  votes?: Vote[];
}

export interface Vote {
  id: string;
  announcementId: string;
  userId: string;
  optionIndex: number;
  createdAt: Date;
  user?: User;
}

export interface InventoryItem {
  id: string;
  homeId: string;
  ownerId: string;
  name: string;
  description?: string;
  value?: number;
  condition?: string;
  imageUrl?: string;
  isShared: boolean;
  createdAt: Date;
  owner?: User;
}

export interface Settlement {
  id: string;
  homeId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: SettlementStatus;
  note?: string;
  createdAt: Date;
  confirmedAt?: Date;
  fromUser?: User;
  toUser?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// ==================== CALENDAR EVENT ====================

export interface CalendarEvent {
  id: string;
  homeId: string;
  createdById: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  color?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
}

export interface AggregatedCalendarItem {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  color: string;
  type: 'event' | 'task' | 'expense' | 'reservation';
  meta?: Record<string, unknown>;
}

// ==================== SHARED SPACE / RESERVATION ====================

export interface SharedSpace {
  id: string;
  homeId: string;
  name: string;
  description?: string;
  icon?: string;
  maxDuration?: number;
  slotSize: number;
  isActive: boolean;
  createdAt: Date;
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  spaceId: string;
  reservedById: string;
  homeId: string;
  startTime: Date;
  endTime: Date;
  note?: string;
  createdAt: Date;
  space?: SharedSpace;
  reservedBy?: User;
}

// ==================== HOUSE RULE ====================

export interface HouseRule {
  id: string;
  homeId: string;
  createdById: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  isActive: boolean;
  acceptedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
}

// ==================== MONTHLY REPORT ====================

export interface MonthlyReport {
  month: number;
  year: number;
  expenses: {
    total: number;
    count: number;
    byMember: Array<{ userId: string; name: string; totalPaid: number; totalOwed: number }>;
  };
  tasks: {
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    byMember: Array<{ userId: string; name: string; completed: number; assigned: number }>;
  };
  karma: {
    ranking: Array<{ userId: string; name: string; karma: number }>;
  };
}

// ==================== API TYPES ====================

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== BALANCE TYPES ====================

export interface Balance {
  userId: string;
  amount: number; // positivo = acreedor, negativo = deudor
}

export interface Transfer {
  from: string; // deudor
  to: string; // acreedor
  amount: number;
}

export interface UserBalance {
  user: User;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

// ==================== AUTH TYPES ====================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface TokenPayload {
  sub: string; // userId
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
