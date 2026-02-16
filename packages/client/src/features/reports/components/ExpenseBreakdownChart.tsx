import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyReport } from '@conviviapp/shared';

interface ExpenseBreakdownChartProps {
  expenses: MonthlyReport['expenses'];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#4f46e5', '#6d28d9'];

export function ExpenseBreakdownChart({ expenses }: ExpenseBreakdownChartProps) {
  const pieData = expenses.byMember
    .filter((m) => m.totalPaid > 0)
    .map((m) => ({
      name: m.name,
      value: m.totalPaid,
    }));

  const barData = expenses.byMember.map((m) => ({
    name: m.name.split(' ')[0],
    pagado: m.totalPaid,
    debido: m.totalOwed,
  }));

  if (expenses.count === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose de gastos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sin gastos este mes
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quien pago</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagado vs Debido</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
              <Legend />
              <Bar dataKey="pagado" fill="#6366f1" name="Pagado" radius={[4, 4, 0, 0]} />
              <Bar dataKey="debido" fill="#a78bfa" name="Debido" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
