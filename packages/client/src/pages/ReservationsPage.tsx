import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { SharedSpace } from '@conviviapp/shared';
import {
  SpaceList,
  SpaceTimeline,
  CreateReservationForm,
  useSharedSpaces,
  useReservationsBySpace,
} from '@/features/reservations';
import { useHomeMembers } from '@/features/homes';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/ui/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function ReservationsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const { user } = useAuthStore();
  const { data: members } = useHomeMembers(homeId!);
  const { data: spaces, isLoading: spacesLoading } = useSharedSpaces(homeId!);

  const [selectedSpace, setSelectedSpace] = useState<SharedSpace | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Cargar reservas del espacio seleccionado
  const { data: reservations, isLoading: reservationsLoading } =
    useReservationsBySpace(
      homeId!,
      selectedSpace?.id || '',
      selectedDate
    );

  // Determinar si el usuario es admin
  const isAdmin = members?.some(
    (m: any) => m.userId === user?.id && m.role === 'ADMIN'
  ) ?? false;

  const handleSelectSpace = (space: SharedSpace) => {
    setSelectedSpace(space);
  };

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
            <h1 className="text-xl font-bold">Reservas</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Lista de espacios */}
          <SpaceList
            homeId={homeId!}
            spaces={spaces}
            isLoading={spacesLoading}
            isAdmin={isAdmin}
            onSelectSpace={handleSelectSpace}
            selectedSpaceId={selectedSpace?.id}
          />

          {/* Si hay un espacio seleccionado, mostrar selector de fecha + timeline + formulario */}
          {selectedSpace && (
            <>
              {/* Selector de fecha */}
              <div className="flex items-center gap-4">
                <Label htmlFor="date-picker" className="shrink-0 font-medium">
                  Fecha:
                </Label>
                <Input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                {selectedDate !== getTodayString() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(getTodayString())}
                  >
                    Hoy
                  </Button>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Timeline */}
                <SpaceTimeline
                  homeId={homeId!}
                  space={selectedSpace}
                  reservations={reservations}
                  isLoading={reservationsLoading}
                  selectedDate={selectedDate}
                />

                {/* Formulario de nueva reserva */}
                <CreateReservationForm
                  homeId={homeId!}
                  spaces={spaces}
                  selectedSpaceId={selectedSpace.id}
                  selectedDate={selectedDate}
                />
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
