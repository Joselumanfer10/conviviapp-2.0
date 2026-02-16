// Utilidades compartidas entre cliente y servidor

import type { Balance, Transfer } from '../types';

// ==================== SIMPLIFICACIÓN DE DEUDAS ====================

/**
 * Algoritmo de simplificación de deudas.
 * Minimiza el número de transferencias necesarias para saldar todas las deudas.
 *
 * @param balances - Array de balances por usuario (positivo = acreedor, negativo = deudor)
 * @returns Array de transferencias optimizadas
 *
 * @example
 * const balances = [
 *   { userId: 'ana', amount: 125 },    // Se le deben 125€
 *   { userId: 'bob', amount: 25 },     // Se le deben 25€
 *   { userId: 'carlos', amount: -75 }, // Debe 75€
 *   { userId: 'diana', amount: -75 },  // Debe 75€
 * ];
 *
 * const transfers = simplifyDebts(balances);
 * // Resultado: [
 * //   { from: 'carlos', to: 'ana', amount: 75 },
 * //   { from: 'diana', to: 'ana', amount: 50 },
 * //   { from: 'diana', to: 'bob', amount: 25 },
 * // ]
 */
export function simplifyDebts(balances: Balance[]): Transfer[] {
  const transfers: Transfer[] = [];
  const EPSILON = 0.01;

  // Copia de trabajo - filtrar balances insignificantes
  let working = balances
    .filter((b) => Math.abs(b.amount) > EPSILON)
    .map((b) => ({ ...b }));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Separar y ordenar deudores y acreedores
    const debtors = working
      .filter((b) => b.amount < -EPSILON)
      .sort((a, b) => a.amount - b.amount); // Más negativo primero

    const creditors = working
      .filter((b) => b.amount > EPSILON)
      .sort((a, b) => b.amount - a.amount); // Más positivo primero

    // Si no hay deudores o acreedores, terminamos
    if (debtors.length === 0 || creditors.length === 0) break;

    const maxDebtor = debtors[0];
    const maxCreditor = creditors[0];

    // Transferencia = mínimo entre lo que debe el deudor y lo que se le debe al acreedor
    const amount = Math.min(Math.abs(maxDebtor.amount), maxCreditor.amount);

    transfers.push({
      from: maxDebtor.userId,
      to: maxCreditor.userId,
      amount: roundToTwoDecimals(amount),
    });

    // Actualizar balances
    maxDebtor.amount += amount;
    maxCreditor.amount -= amount;

    // Filtrar los que ya están saldados
    working = working.filter((b) => Math.abs(b.amount) > EPSILON);
  }

  return transfers;
}

// ==================== CÁLCULO DE BALANCES ====================

/**
 * Calcula los balances de cada usuario a partir de los gastos.
 *
 * @param expenses - Array de gastos con participantes
 * @returns Array de balances por usuario
 */
export function calculateBalances(
  expenses: Array<{
    paidById: string;
    amount: number;
    participants: Array<{ userId: string; share: number }>;
  }>
): Balance[] {
  const balanceMap = new Map<string, number>();

  for (const expense of expenses) {
    // El pagador recibe crédito por lo que pagó
    const currentPayer = balanceMap.get(expense.paidById) ?? 0;
    balanceMap.set(expense.paidById, currentPayer + expense.amount);

    // Cada participante debe su parte
    for (const participant of expense.participants) {
      const current = balanceMap.get(participant.userId) ?? 0;
      balanceMap.set(participant.userId, current - participant.share);
    }
  }

  return Array.from(balanceMap.entries()).map(([userId, amount]) => ({
    userId,
    amount: roundToTwoDecimals(amount),
  }));
}

// ==================== DIVISIÓN DE GASTOS ====================

/**
 * Divide un gasto en partes iguales entre los participantes.
 * El primer participante absorbe el centavo restante por redondeo.
 */
export function splitEqual(amount: number, participantIds: string[]): Array<{ userId: string; share: number }> {
  const count = participantIds.length;
  const baseShare = Math.floor((amount * 100) / count) / 100;
  const remainder = roundToTwoDecimals(amount - baseShare * count);

  return participantIds.map((userId, index) => ({
    userId,
    share: index === 0 ? roundToTwoDecimals(baseShare + remainder) : baseShare,
  }));
}

/**
 * Divide un gasto por porcentajes.
 */
export function splitByPercentage(
  amount: number,
  percentages: Array<{ userId: string; percentage: number }>
): Array<{ userId: string; share: number }> {
  return percentages.map(({ userId, percentage }) => ({
    userId,
    share: roundToTwoDecimals(amount * (percentage / 100)),
  }));
}

/**
 * Divide un gasto por cantidades fijas.
 */
export function splitByFixedAmounts(
  fixedAmounts: Array<{ userId: string; amount: number }>
): Array<{ userId: string; share: number }> {
  return fixedAmounts.map(({ userId, amount }) => ({
    userId,
    share: roundToTwoDecimals(amount),
  }));
}

// ==================== UTILIDADES ====================

/**
 * Redondea un número a 2 decimales.
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Formatea un monto como moneda.
 */
export function formatCurrency(amount: number, currency = 'EUR', locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formatea una fecha de manera legible.
 */
export function formatDate(date: Date | string, locale = 'es-ES'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Formatea una fecha relativa (hace X tiempo).
 * Nota: actualmente solo soporta español. Para multi-idioma usar Intl.RelativeTimeFormat.
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

/**
 * Genera un código de invitación aleatorio.
 */
export function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Valida si un email tiene formato correcto.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Trunca un texto a una longitud máxima.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
