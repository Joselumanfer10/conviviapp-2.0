// Esquemas de validación Zod compartidos

import { z } from 'zod';
import {
  HomeRole,
  SplitMode,
  TaskStatus,
  TaskFrequency,
  ShoppingItemStatus,
  AnnouncementType,
  SettlementStatus,
} from '../types';

// ==================== AUTH ====================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ==================== HOME ====================

export const createHomeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default('EUR'),
  defaultSplitMode: z.nativeEnum(SplitMode).default(SplitMode.EQUAL),
});

export const updateHomeSchema = createHomeSchema.partial();

export const joinHomeSchema = z.object({
  inviteCode: z.string().min(1, 'El código de invitación es requerido'),
});

export type CreateHomeInput = z.infer<typeof createHomeSchema>;
export type UpdateHomeInput = z.infer<typeof updateHomeSchema>;
export type JoinHomeInput = z.infer<typeof joinHomeSchema>;

// ==================== EXPENSE ====================

export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive('El monto debe ser positivo')
    .max(50000, 'El monto máximo es 50,000€'),
  description: z.string().min(1, 'La descripción es requerida'),
  categoryId: z.string().optional(),
  splitMode: z.nativeEnum(SplitMode).default(SplitMode.EQUAL),
  participants: z
    .array(
      z.object({
        userId: z.string(),
        share: z.number().min(0),
      })
    )
    .optional(),
  receiptUrl: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().min(1).max(31).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ==================== TASK ====================

export const createTaskSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  frequency: z.nativeEnum(TaskFrequency).default(TaskFrequency.WEEKLY),
  difficulty: z.number().min(1).max(5).default(1),
});

export const updateTaskSchema = createTaskSchema.partial();

export const assignTaskSchema = z.object({
  assignedToId: z.string(),
  dueDate: z.coerce.date(),
});

export const completeTaskSchema = z.object({
  notes: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

// ==================== SHOPPING ====================

export const createShoppingItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  quantity: z.number().int().positive().default(1),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export const updateShoppingItemSchema = createShoppingItemSchema.partial();

export const buyShoppingItemSchema = z.object({
  price: z.number().positive().optional(),
  store: z.string().optional(),
});

export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>;
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>;
export type BuyShoppingItemInput = z.infer<typeof buyShoppingItemSchema>;

// ==================== SETTLEMENT ====================

export const createSettlementSchema = z.object({
  toUserId: z.string(),
  amount: z.number().positive('El monto debe ser positivo'),
  note: z.string().optional(),
});

export const confirmSettlementSchema = z.object({
  status: z.enum([SettlementStatus.CONFIRMED, SettlementStatus.REJECTED]),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type ConfirmSettlementInput = z.infer<typeof confirmSettlementSchema>;

// ==================== ANNOUNCEMENT ====================

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  content: z.string().min(1, 'El contenido es requerido').max(5000),
  type: z.nativeEnum(AnnouncementType).default(AnnouncementType.INFO),
  isPinned: z.boolean().default(false),
  expiresAt: z.coerce.date().optional(),
  options: z.array(z.string().min(1)).max(10).optional().default([]),
  quorum: z.number().int().positive().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const castVoteSchema = z.object({
  optionIndex: z.number().int().min(0),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;

// ==================== CALENDAR EVENT ====================

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  allDay: z.boolean().default(false),
  color: z.string().optional(),
  category: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;

// ==================== SHARED SPACE / RESERVATION ====================

export const createSharedSpaceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  maxDuration: z.number().int().positive().optional(),
  slotSize: z.number().int().positive().default(30),
});

export const updateSharedSpaceSchema = createSharedSpaceSchema.partial();

export const createReservationSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  note: z.string().max(500).optional(),
});

export type CreateSharedSpaceInput = z.infer<typeof createSharedSpaceSchema>;
export type UpdateSharedSpaceInput = z.infer<typeof updateSharedSpaceSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;

// ==================== HOUSE RULE ====================

export const createHouseRuleSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida').max(5000),
  category: z.string().default('general'),
  priority: z.number().int().min(0).default(0),
});

export const updateHouseRuleSchema = createHouseRuleSchema.partial();

export type CreateHouseRuleInput = z.infer<typeof createHouseRuleSchema>;
export type UpdateHouseRuleInput = z.infer<typeof updateHouseRuleSchema>;

// ==================== COMMON ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
