import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketEvent } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  message: string;
  timestamp: Date;
  type: 'expense' | 'task' | 'shopping' | 'settlement' | 'member';
}

const typeIcons: Record<string, string> = {
  expense: '$',
  task: '!',
  shopping: '*',
  settlement: '=',
  member: '+',
};

const typeColors: Record<string, string> = {
  expense: 'bg-blue-500/10 text-blue-500',
  task: 'bg-green-500/10 text-green-500',
  shopping: 'bg-orange-500/10 text-orange-500',
  settlement: 'bg-purple-500/10 text-purple-500',
  member: 'bg-pink-500/10 text-pink-500',
};

interface EventPayload {
  actorId?: string;
  [key: string]: unknown;
}

export function ActivityFeed({ homeId }: { homeId: string | undefined }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { user } = useAuthStore();

  const addActivity = (message: string, type: ActivityItem['type'], payload: EventPayload) => {
    if (payload.actorId === user?.id) return;
    setActivities((prev) => [
      { id: `${Date.now()}-${Math.random()}`, message, timestamp: new Date(), type },
      ...prev.slice(0, 9),
    ]);
  };

  useSocketEvent<EventPayload>('expense:created', (data) => {
    if (!homeId) return;
    const expense = data.expense as { description?: string; amount?: number };
    addActivity(`Nuevo gasto: ${expense?.description || ''} (${expense?.amount?.toFixed(2)} €)`, 'expense', data);
  });

  useSocketEvent<EventPayload>('assignment:completed', (data) => {
    if (!homeId) return;
    addActivity('Tarea completada', 'task', data);
  });

  useSocketEvent<EventPayload>('shopping:item-bought', (data) => {
    if (!homeId) return;
    const item = data.item as { name?: string };
    addActivity(`Comprado: ${item?.name || ''}`, 'shopping', data);
  });

  useSocketEvent<EventPayload>('settlement:confirmed', (data) => {
    if (!homeId) return;
    addActivity('Pago confirmado', 'settlement', data);
  });

  useSocketEvent<EventPayload>('home:member-joined', (data) => {
    if (!homeId) return;
    const member = data.member as { name?: string };
    addActivity(`Nuevo miembro: ${member?.name || ''}`, 'member', data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <p>Sin actividad reciente</p>
            <p className="text-xs mt-1">Los eventos aparecen aqui en tiempo real</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${typeColors[activity.type]}`}>
                    {typeIcons[activity.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
