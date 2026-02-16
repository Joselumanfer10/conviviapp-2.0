// Tipos de eventos de dominio para el Event Bus

export interface ExpenseDTO {
  id: string;
  amount: number;
  description: string;
  paidById: string;
  splitMode: string;
}

export interface TaskDTO {
  id: string;
  name: string;
  frequency: string;
}

export interface TaskAssignmentDTO {
  id: string;
  taskId: string;
  assignedToId: string;
  status: string;
  dueDate: Date;
}

export interface ShoppingItemDTO {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

export interface BalanceDTO {
  userId: string;
  balance: number;
}

export interface MemberDTO {
  userId: string;
  role: string;
  name: string;
}

export interface SettlementDTO {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: string;
}

export interface AnnouncementDTO {
  id: string;
  title: string;
  type: string;
  authorId: string;
}

export interface VoteDTO {
  announcementId: string;
  userId: string;
  optionIndex: number;
}

export interface NotificationDTO {
  title: string;
  body: string;
  link?: string;
}

export interface CalendarEventDTO {
  id: string;
  title: string;
  startDate: Date;
  createdById: string;
}

export interface SpaceDTO {
  id: string;
  name: string;
  icon?: string | null;
}

export interface ReservationDTO {
  id: string;
  spaceId: string;
  spaceName: string;
  reservedById: string;
  startTime: Date;
  endTime: Date;
}

export interface HouseRuleDTO {
  id: string;
  title: string;
  category: string;
}

// Mapa de eventos de dominio con sus payloads
export interface DomainEvents {
  // Gastos
  'expense:created': { homeId: string; expense: ExpenseDTO; actorId: string };
  'expense:updated': { homeId: string; expense: ExpenseDTO; actorId: string };
  'expense:deleted': { homeId: string; expenseId: string; actorId: string };

  // Balances
  'balance:updated': { homeId: string };

  // Liquidaciones
  'settlement:created': { homeId: string; settlement: SettlementDTO; actorId: string };
  'settlement:confirmed': { homeId: string; settlement: SettlementDTO; actorId: string };
  'settlement:rejected': { homeId: string; settlement: SettlementDTO; actorId: string };

  // Tareas
  'task:created': { homeId: string; task: TaskDTO; actorId: string };
  'task:updated': { homeId: string; task: TaskDTO; actorId: string };
  'task:deleted': { homeId: string; taskId: string; actorId: string };

  // Asignaciones de tareas
  'assignment:created': { homeId: string; assignment: TaskAssignmentDTO; actorId: string };
  'assignment:started': { homeId: string; assignment: TaskAssignmentDTO; actorId: string };
  'assignment:completed': { homeId: string; assignment: TaskAssignmentDTO; actorId: string };
  'assignment:skipped': { homeId: string; assignment: TaskAssignmentDTO; actorId: string };

  // Lista de compras
  'shopping:item-added': { homeId: string; item: ShoppingItemDTO; actorId: string };
  'shopping:item-updated': { homeId: string; item: ShoppingItemDTO; actorId: string };
  'shopping:item-deleted': { homeId: string; itemId: string; actorId: string };
  'shopping:item-bought': { homeId: string; item: ShoppingItemDTO; actorId: string };

  // Anuncios
  'announcement:created': { homeId: string; announcement: AnnouncementDTO; actorId: string };
  'announcement:updated': { homeId: string; announcement: AnnouncementDTO; actorId: string };
  'announcement:deleted': { homeId: string; announcementId: string; actorId: string };

  // Votos
  'vote:cast': { homeId: string; vote: VoteDTO; actorId: string };
  'vote:removed': { homeId: string; vote: VoteDTO; actorId: string };

  // Hogar
  'home:member-joined': { homeId: string; member: MemberDTO };
  'home:member-left': { homeId: string; memberId: string };
  'home:member-updated': { homeId: string; member: MemberDTO };

  // Calendario
  'calendar:created': { homeId: string; calendarEvent: CalendarEventDTO; actorId: string };
  'calendar:updated': { homeId: string; calendarEvent: CalendarEventDTO; actorId: string };
  'calendar:deleted': { homeId: string; calendarEventId: string; actorId: string };

  // Espacios compartidos
  'space:created': { homeId: string; space: SpaceDTO; actorId: string };
  'space:updated': { homeId: string; space: SpaceDTO; actorId: string };
  'space:deleted': { homeId: string; spaceId: string; actorId: string };

  // Reservas
  'reservation:created': { homeId: string; reservation: ReservationDTO; actorId: string };
  'reservation:deleted': { homeId: string; reservationId: string; spaceId: string; actorId: string };

  // Reglas del hogar
  'rule:created': { homeId: string; rule: HouseRuleDTO; actorId: string };
  'rule:updated': { homeId: string; rule: HouseRuleDTO; actorId: string };
  'rule:deleted': { homeId: string; ruleId: string; actorId: string };
  'rule:accepted': { homeId: string; rule: HouseRuleDTO; actorId: string };

  // Notificaciones (personales, van a user:{userId})
  'notification:created': { homeId: string; userId: string; actorId: string; notification: NotificationDTO };
}

export type DomainEventName = keyof DomainEvents;
