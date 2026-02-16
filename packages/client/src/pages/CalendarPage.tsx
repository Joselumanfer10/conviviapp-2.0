import { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarGrid,
  CalendarDayDetail,
  CreateCalendarEventForm,
  useAggregatedCalendar,
  useDeleteCalendarEvent,
} from '@/features/calendar';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { AggregatedCalendarItem } from '@conviviapp/shared';

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function CalendarPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useAggregatedCalendar(homeId!, month, year);
  const deleteMutation = useDeleteCalendarEvent(homeId!);

  const handlePrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setSelectedDate(now);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      deleteMutation.mutate(eventId);
    },
    [deleteMutation]
  );

  // Items del dia seleccionado
  const selectedDayItems = useMemo<AggregatedCalendarItem[]>(() => {
    if (!selectedDate || !items) return [];
    return items.filter((item) => isSameDay(new Date(item.start), selectedDate));
  }, [selectedDate, items]);

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/homes/${homeId}`}>
              <Button variant="ghost" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Calendario</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Boton para mostrar/ocultar formulario */}
          <Button
            variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto"
          >
            {showForm ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo evento
              </span>
            )}
          </Button>

          {/* Formulario colapsable */}
          {showForm && (
            <CreateCalendarEventForm
              homeId={homeId!}
              defaultDate={selectedDate || undefined}
              onSuccess={() => setShowForm(false)}
            />
          )}

          {/* Layout principal: Grid + Detalle */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grilla del calendario */}
              <div className="lg:col-span-2">
                <CalendarGrid
                  month={month}
                  year={year}
                  items={items || []}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                />
              </div>

              {/* Panel lateral de detalle del dia */}
              <div className="lg:col-span-1">
                {selectedDate ? (
                  <CalendarDayDetail
                    date={selectedDate}
                    items={selectedDayItems}
                    onDeleteEvent={handleDeleteEvent}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
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
                    <p className="text-sm text-muted-foreground">
                      Selecciona un dia para ver sus detalles
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
