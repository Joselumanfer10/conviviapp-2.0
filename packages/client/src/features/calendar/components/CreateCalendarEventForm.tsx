import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCalendarEvent } from '../hooks/useCalendar';

interface CreateCalendarEventFormProps {
  homeId: string;
  defaultDate?: Date;
  onSuccess?: () => void;
}

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarillo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
];

const CATEGORY_OPTIONS = [
  'general',
  'reunion',
  'fiesta',
  'limpieza',
  'mantenimiento',
  'otro',
];

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateCalendarEventForm({
  homeId,
  defaultDate,
  onSuccess,
}: CreateCalendarEventFormProps) {
  const createMutation = useCreateCalendarEvent(homeId);

  const defaultStart = defaultDate || new Date();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(formatDateForInput(defaultStart));
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [category, setCategory] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El titulo es requerido');
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        allDay,
        color,
        category,
      },
      {
        onSuccess: () => {
          toast.success('Evento creado');
          setTitle('');
          setDescription('');
          setEndDate('');
          setAllDay(false);
          setColor('#3b82f6');
          setCategory('general');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Error al crear el evento');
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nuevo evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titulo */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-title">Titulo</Label>
              <Input
                id="cal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del evento"
                maxLength={200}
              />
            </div>

            {/* Descripcion */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-description">Descripcion (opcional)</Label>
              <textarea
                id="cal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles del evento"
                maxLength={2000}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Todo el dia */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cal-allday"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="cal-allday" className="cursor-pointer">
                Todo el dia
              </Label>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cal-start">
                  {allDay ? 'Fecha' : 'Inicio'}
                </Label>
                <Input
                  id="cal-start"
                  type={allDay ? 'date' : 'datetime-local'}
                  value={allDay ? startDate.split('T')[0] : startDate}
                  onChange={(e) => setStartDate(
                    allDay ? `${e.target.value}T00:00` : e.target.value
                  )}
                />
              </div>
              {!allDay && (
                <div className="space-y-1.5">
                  <Label htmlFor="cal-end">Fin (opcional)</Label>
                  <Input
                    id="cal-end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    title={opt.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === opt.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: opt.value }}
                  />
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-category">Categoria</Label>
              <select
                id="cal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Boton submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creando...
                </span>
              ) : (
                'Crear evento'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
