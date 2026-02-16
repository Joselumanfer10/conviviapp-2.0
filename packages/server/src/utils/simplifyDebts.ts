/**
 * Algoritmo de simplificación de deudas.
 *
 * Recibe balances (positivo = acreedor, negativo = deudor)
 * y retorna el mínimo número de transferencias necesarias.
 */

export interface Balance {
  userId: string;
  amount: number; // positivo = acreedor, negativo = deudor
}

export interface Transfer {
  from: string; // deudor
  to: string; // acreedor
  amount: number;
}

const EPSILON = 0.01;

export function simplifyDebts(balances: Balance[]): Transfer[] {
  const transfers: Transfer[] = [];

  // Separar deudores y acreedores, ignorar balances cercanos a cero
  const debtors = balances
    .filter((b) => b.amount < -EPSILON)
    .map((b) => ({ userId: b.userId, remaining: Math.abs(b.amount) }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter((b) => b.amount > EPSILON)
    .map((b) => ({ userId: b.userId, remaining: b.amount }))
    .sort((a, b) => b.remaining - a.remaining);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > EPSILON) {
      transfers.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100,
      });

      debtor.remaining -= amount;
      creditor.remaining -= amount;
    }

    if (debtor.remaining < EPSILON) i++;
    if (creditor.remaining < EPSILON) j++;
  }

  return transfers;
}
