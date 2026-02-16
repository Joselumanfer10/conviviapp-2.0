import { useState } from 'react';
import type { SharedSpace } from '@conviviapp/shared';
import { useCreateReservation } from '../hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateReservationFormProps {
  homeId: string;
  spaces: SharedSpace[] | undefined;
  selectedSpaceId?: string;
  selectedDate: string;
  onSuccess?: () => void;
}

export function CreateReservationForm({
  homeId,
  spaces,
  selectedSpaceId,
  selectedDate,
  onSuccess,
}: CreateReservationFormProps) {
  const [spaceId, setSpaceId] = useState(selectedSpaceId || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');

  const createReservationMutation = useCreateReservation(homeId);

  // Actualizar spaceId cuando cambia el selectedSpaceId
  if (selectedSpaceId && selectedSpaceId !== spaceId) {
    setSpaceId(selectedSpaceId);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!spaceId || !startTime || !endTime) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    // Construir fechas completas
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = new Date(`${selectedDate}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      toast.error('La hora de inicio debe ser anterior a la de fin');
      return;
    }

    createReservationMutation.mutate(
      {
        spaceId,
        data: {
          startTime: startDateTime,
          endTime: endDateTime,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Reserva creada correctamente');
          setStartTime('');
          setEndTime('');
          setNote('');
          onSuccess?.();
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.error?.message || 'Error al crear la reserva';
          toast.error(message);
        },
      }
    );
  };

  // Generar opciones de hora basadas en el slotSize del espacio seleccionado
  const selectedSpace = spaces?.find((s) => s.id === spaceId);
  const slotSize = selectedSpace?.slotSize || 30;

  const timeOptions: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += slotSize) {
      timeOptions.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Nueva reserva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reservation-space">Espacio</Label>
            <select
              id="reservation-space"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Seleccionar espacio...</option>
              {spaces?.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                  {space.maxDuration ? ` (max ${space.maxDuration} min)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reservation-start">Hora inicio</Label>
              <select
                id="reservation-start"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Inicio</option>
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-end">Hora fin</Label>
              <select
                id="reservation-end"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Fin</option>
                {timeOptions
                  .filter((time) => !startTime || time > startTime)
                  .map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservation-note">Nota (opcional)</Label>
            <Input
              id="reservation-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Colada grande, Cena de grupo..."
              maxLength={500}
            />
          </div>

          <Button
            type="submit"
            disabled={
              createReservationMutation.isPending ||
              !spaceId ||
              !startTime ||
              !endTime
            }
            className="w-full"
          >
            {createReservationMutation.isPending
              ? 'Reservando...'
              : 'Reservar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
