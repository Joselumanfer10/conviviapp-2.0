import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyReport } from '@conviviapp/shared';

interface KarmaEvolutionChartProps {
  karma: MonthlyReport['karma'];
}

const COLORS = ['#f59e0b', '#eab308', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'];

export function KarmaEvolutionChart({ karma }: KarmaEvolutionChartProps) {
  const data = karma.ranking.map((m, idx) => ({
    name: m.name.split(' ')[0],
    karma: m.karma,
    rank: idx + 1,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking de Karma</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sin datos de karma
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ranking de Karma</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={(value) => `${value} pts`} />
            <Bar dataKey="karma" name="Karma" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
