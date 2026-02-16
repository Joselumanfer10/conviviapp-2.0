import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer } from '@/lib/animations';

interface KarmaEntry {
  rank: number;
  userId?: string;
  odUserId?: string;
  name: string;
  avatarUrl?: string | null;
  karma: number;
}

interface KarmaRankingChartProps {
  ranking: KarmaEntry[] | undefined;
}

const medals = ['', '1', '2', '3'];
const medalColors = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-700'];

export function KarmaRankingChart({ ranking }: KarmaRankingChartProps) {
  if (!ranking?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking Karma</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Sin datos de karma
        </CardContent>
      </Card>
    );
  }

  const maxKarma = Math.max(...ranking.map((k) => k.karma), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ranking Karma</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {ranking.map((entry, index) => (
            <motion.div
              key={entry.userId || entry.odUserId || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className={`w-6 text-center font-bold text-sm ${medalColors[entry.rank] || 'text-muted-foreground'}`}>
                {medals[entry.rank] || `${entry.rank}`}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{entry.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{entry.karma} pts</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.karma / maxKarma) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
