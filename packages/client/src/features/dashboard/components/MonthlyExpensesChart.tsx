import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Expense {
  amount: number;
  createdAt: string | Date;
}

interface MonthlyExpensesChartProps {
  expenses: Expense[] | undefined;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function MonthlyExpensesChart({ expenses }: MonthlyExpensesChartProps) {
  const data = useMemo(() => {
    if (!expenses?.length) return [];

    const now = new Date();
    const months: { name: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const total = expenses
        .filter((e) => {
          const date = new Date(e.createdAt);
          return date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      months.push({
        name: MONTH_NAMES[month],
        total: Math.round(total * 100) / 100,
      });
    }

    return months;
  }, [expenses]);

  if (data.length === 0 || data.every((d) => d.total === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos mensuales</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sin datos de gastos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos mensuales</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(2)} €`, 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              itemStyle={{ color: 'hsl(var(--card-foreground))' }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
