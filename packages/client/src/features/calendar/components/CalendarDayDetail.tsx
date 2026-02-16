import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AggregatedCalendarItem } from '@conviviapp/shared';

interface CalendarDayDetailProps {
  date: Date;
  items: AggregatedCalendarItem[];
  onDeleteEvent?: (eventId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  event: 'Eventos',
  task: 'Tareas',
  expense: 'Gastos',
  reservation: 'Reservas',
};

const TYPE_ICONS: Record<string, JSX.Element> = {
  event: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  task: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  expense: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  reservation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

const TYPE_COLORS: Record<string, string> = {
  event: 'border-l-blue-500',
  task: 'border-l-amber-500',
  expense: 'border-l-emerald-500',
  reservation: 'border-l-violet-500',
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function CalendarDayDetail({ date, items, onDeleteEvent }: CalendarDayDetailProps) {
  // Agrupar items por tipo
  const grouped = items.reduce<Record<string, AggregatedCalendarItem[]>>((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeOrder = ['event', 'task', 'expense', 'reservation'];
  const sortedTypes = typeOrder.filter((type) => grouped[type]?.length);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base capitalize">{formatDate(date)}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? 'No hay actividad este dia'
            : `${items.length} ${items.length === 1 ? 'elemento' : 'elementos'}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {sortedTypes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <svg
                className="w-12 h-12 text-muted-foreground/40 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">Dia libre</p>
            </motion.div>
          ) : (
            sortedTypes.map((type) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-muted-foreground">
                    {TYPE_ICONS[type]}
                  </span>
                  <h3 className="text-sm font-medium">{TYPE_LABELS[type]}</h3>
                  <span className="text-xs text-muted-foreground">
                    ({grouped[type].length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {grouped[type].map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-2 pl-3 py-2 rounded-md bg-muted/50 border-l-2 ${TYPE_COLORS[type]}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.meta?.allDay ? (
                            <span className="text-xs text-muted-foreground">Todo el dia</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(item.start)}
                              {item.end && ` - ${formatTime(item.end)}`}
                            </span>
                          )}
                          {item.meta?.assignedTo ? (
                            <span className="text-xs text-muted-foreground">
                              - {String(item.meta.assignedTo)}
                            </span>
                          ) : null}
                          {item.meta?.paidBy ? (
                            <span className="text-xs text-muted-foreground">
                              - {String(item.meta.paidBy)}
                            </span>
                          ) : null}
                          {item.meta?.reservedBy ? (
                            <span className="text-xs text-muted-foreground">
                              - {String(item.meta.reservedBy)}
                            </span>
                          ) : null}
                          {item.meta?.status ? (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              item.meta.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : item.meta.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.meta.status === 'COMPLETED' ? 'Completada' :
                                item.meta.status === 'PENDING' ? 'Pendiente' :
                                  item.meta.status === 'IN_PROGRESS' ? 'En progreso' :
                                    String(item.meta.status)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {item.type === 'event' && onDeleteEvent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => onDeleteEvent(item.id)}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
