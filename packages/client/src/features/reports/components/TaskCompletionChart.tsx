import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyReport } from '@conviviapp/shared';

interface TaskCompletionChartProps {
  tasks: MonthlyReport['tasks'];
}

export function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const data = tasks.byMember.map((m) => ({
    name: m.name.split(' ')[0],
    completadas: m.completed,
    pendientes: m.assigned - m.completed,
  }));

  if (tasks.totalAssigned === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tareas por miembro</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sin tareas asignadas este mes
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tareas por miembro</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" className="text-xs" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completadas" stackId="a" fill="#22c55e" name="Completadas" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendientes" stackId="a" fill="#ef4444" name="Pendientes" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
