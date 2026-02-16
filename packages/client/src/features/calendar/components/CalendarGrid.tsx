import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AggregatedCalendarItem } from '@conviviapp/shared';

interface CalendarGridProps {
  month: number;
  year: number;
  items: AggregatedCalendarItem[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, transform so Monday = 0
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getItemsForDay(items: AggregatedCalendarItem[], day: number, month: number, year: number) {
  const targetDate = new Date(year, month - 1, day);
  return items.filter((item) => {
    const start = new Date(item.start);
    return isSameDay(start, targetDate);
  });
}

// Colores por tipo para los dots
const TYPE_COLORS: Record<string, string> = {
  event: 'bg-blue-500',
  task: 'bg-amber-500',
  expense: 'bg-emerald-500',
  reservation: 'bg-violet-500',
};

export function CalendarGrid({
  month,
  year,
  items,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarGridProps) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Dias del mes anterior para rellenar la primera semana
  const prevMonthDays = getDaysInMonth(
    month === 1 ? year - 1 : year,
    month === 1 ? 12 : month - 1
  );

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      items: AggregatedCalendarItem[];
    }> = [];

    // Dias del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        items: [],
      });
    }

    // Dias del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayItems = getItemsForDay(items, day, month, year);

      days.push({
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        items: dayItems,
      });
    }

    // Dias del mes siguiente para completar la grilla
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        items: [],
      });
    }

    return days;
  }, [month, year, items, selectedDate, daysInMonth, firstDay, prevMonthDays, today]);

  // Agrupar tipos unicos para cada dia (para mostrar dots)
  function getUniqueTypes(dayItems: AggregatedCalendarItem[]): string[] {
    const types = new Set(dayItems.map((i) => i.type));
    return Array.from(types);
  }

  return (
    <Card className="p-4">
      {/* Navegacion del mes */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onPrevMonth}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={onToday} className="text-xs">
            Hoy
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Cabecera de dias */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Grilla de dias */}
      <div className="grid grid-cols-7">
        {calendarDays.map((cell, index) => {
          const uniqueTypes = getUniqueTypes(cell.items);

          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (cell.isCurrentMonth) {
                  onSelectDate(new Date(year, month - 1, cell.day));
                }
              }}
              className={`
                relative flex flex-col items-center justify-start p-1 min-h-[48px] sm:min-h-[56px] rounded-md transition-colors
                ${cell.isCurrentMonth ? 'cursor-pointer hover:bg-muted' : 'opacity-30 cursor-default'}
                ${cell.isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''}
                ${cell.isToday && !cell.isSelected ? 'bg-accent' : ''}
              `}
            >
              <span
                className={`
                  text-sm font-medium
                  ${cell.isToday ? 'text-primary font-bold' : ''}
                  ${cell.isSelected ? 'text-primary' : ''}
                  ${!cell.isCurrentMonth ? 'text-muted-foreground' : ''}
                `}
              >
                {cell.day}
              </span>

              {/* Dots indicando tipos de eventos */}
              {uniqueTypes.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {uniqueTypes.slice(0, 4).map((type) => (
                    <span
                      key={type}
                      className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[type] || 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}

              {/* Contador si hay muchos items */}
              {cell.items.length > 3 && (
                <span className="text-[10px] text-muted-foreground leading-none">
                  +{cell.items.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-muted-foreground">Eventos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-muted-foreground">Tareas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Gastos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-xs text-muted-foreground">Reservas</span>
        </div>
      </div>
    </Card>
  );
}
