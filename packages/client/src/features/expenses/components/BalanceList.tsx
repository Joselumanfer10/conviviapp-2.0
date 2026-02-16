import type { UserBalance } from '@conviviapp/shared';

interface BalanceListProps {
  balances: UserBalance[];
}

export function BalanceList({ balances }: BalanceListProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  return (
    <div className="space-y-3">
      {balances.map((balance) => (
        <div
          key={balance.user.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {balance.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{balance.user.name}</p>
              <p className="text-xs text-muted-foreground">
                Pago: {formatCurrency(balance.totalPaid)} / Debe:{' '}
                {formatCurrency(balance.totalOwed)}
              </p>
            </div>
          </div>
          <div
            className={`font-semibold ${
              balance.balance > 0
                ? 'text-green-600'
                : balance.balance < 0
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            {balance.balance > 0 ? '+' : ''}
            {formatCurrency(balance.balance)}
          </div>
        </div>
      ))}
    </div>
  );
}
