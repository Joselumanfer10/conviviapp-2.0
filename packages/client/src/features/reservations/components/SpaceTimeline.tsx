import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Reservation, SharedSpace } from '@conviviapp/shared';
import { useAuthStore } from '@/stores/auth.store';
import { useDeleteReservation } from '../hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Colores para distinguir usuarios
const USER_COLORS = [
  'bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300',
  'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300',
  'bg-purple-500/20 border-purple-500/50 text-purple-700 dark:text-purple-300',
  'bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-300',
  'bg-pink-500/20 border-pink-500/50 text-pink-700 dark:text-pink-300',
  'bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-300',
  'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300',
  'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300',
];

interface SpaceTimelineProps {
  homeId: string;
  space: SharedSpace;
  reservations: Reservation[] | undefined;
  isLoading: boolean;
  selectedDate: string;
}

function formatTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}


export function SpaceTimeline({
  homeId,
  space,
  reservations,
  isLoading,
  selectedDate,
}: SpaceTimelineProps) {
  const { user } = useAuthStore();
  const deleteReservationMutation = useDeleteReservation(homeId);

  // Mapa de color por usuario
  const userColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueUsers = [...new Set(reservations?.map((r) => r.reservedById) || [])];
    uniqueUsers.forEach((userId, index) => {
      map.set(userId, USER_COLORS[index % USER_COLORS.length]);
    });
    return map;
  }, [reservations]);

  // Generar time slots para las horas del dia donde hay reservas (o un rango razonable)
  const timeSlots = useMemo(() => {
    if (!reservations || reservations.length === 0) {
      // Mostrar rango 8:00 - 22:00 por defecto
      const slots: string[] = [];
      for (let hour = 8; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }

    // Encontrar rango de horas que cubren las reservas
    let minHour = 23;
    let maxHour = 0;
    reservations.forEach((r) => {
      const startHour = new Date(r.startTime).getHours();
      const endHour = new Date(r.endTime).getHours();
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });

    // Margen de una hora
    minHour = Math.max(0, minHour - 1);
    maxHour = Math.min(23, maxHour + 1);

    const slots: string[] = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, [reservations]);

  const handleDelete = (reservationId: string) => {
    if (confirm('Seguro que quieres cancelar esta reserva?')) {
      deleteReservationMutation.mutate(reservationId);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {space.name} - Reservas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reservations && reservations.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {/* Timeline visual */}
            <div className="relative">
              {timeSlots.map((slot) => {
                const hour = parseInt(slot.split(':')[0]);
                const isCurrentHour = isToday && hour === currentHour;

                // Encontrar reservas que caen en esta hora
                const hourReservations = reservations.filter((r) => {
                  const startHour = new Date(r.startTime).getHours();
                  const endHour = new Date(r.endTime).getHours();
                  const endMinute = new Date(r.endTime).getMinutes();
                  return hour >= startHour && (hour < endHour || (hour === endHour && endMinute > 0));
                });

                return (
                  <div key={slot} className="flex items-stretch min-h-[3rem] border-t border-border/50">
                    <div
                      className={`w-16 shrink-0 text-xs py-2 pr-2 text-right ${
                        isCurrentHour
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {slot}
                    </div>
                    <div className="flex-1 relative py-1 pl-2">
                      {hourReservations.map((r) => {
                        const rStartHour = new Date(r.startTime).getHours();
                        // Solo renderizar en la hora de inicio para evitar duplicados
                        if (rStartHour !== hour) return null;

                        const durationMinutes =
                          (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) /
                          (1000 * 60);
                        const heightSlots = Math.ceil(durationMinutes / 60);
                        const colorClass =
                          userColorMap.get(r.reservedById) || USER_COLORS[0];
                        const isOwn = r.reservedById === user?.id;

                        return (
                          <motion.div
                            key={r.id}
                            variants={staggerItem}
                            className={`rounded-md border px-3 py-2 ${colorClass}`}
                            style={{
                              minHeight: `${heightSlots * 3}rem`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {r.reservedBy?.name || 'Usuario'}
                                </p>
                                <p className="text-xs opacity-75">
                                  {formatTime(r.startTime)} - {formatTime(r.endTime)}
                                </p>
                                {r.note && (
                                  <p className="text-xs opacity-60 mt-1 truncate">
                                    {r.note}
                                  </p>
                                )}
                              </div>
                              {isOwn && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 shrink-0"
                                  onClick={() => handleDelete(r.id)}
                                  disabled={deleteReservationMutation.isPending}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <svg
              className="w-10 h-10 text-muted-foreground mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              No hay reservas para esta fecha
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
