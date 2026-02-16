import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SharedSpace } from '@conviviapp/shared';
import { useCreateSpace, useDeleteSpace } from '../hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

const SPACE_ICONS: Record<string, string> = {
  lavadora: 'M19.5 22H4.5A2.5 2.5 0 012 19.5V4.5A2.5 2.5 0 014.5 2h15A2.5 2.5 0 0122 4.5v15a2.5 2.5 0 01-2.5 2.5zM12 17a5 5 0 100-10 5 5 0 000 10z',
  cocina: 'M4 4h16v16H4V4zm4 8h8M8 12v4m4-4v4m4-4v4',
  bano: 'M4 12h16M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M7 12V6a5 5 0 0110 0v6',
  salon: 'M3 5h18v10H3V5zm0 10l2 4h14l2-4',
  terraza: 'M12 3v1m6.364 1.636l-.707.707M21 12h-1M18.364 18.364l-.707-.707M12 21v-1M5.636 18.364l.707-.707M3 12h1M5.636 5.636l.707.707',
  parking: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm4 4h4a2 2 0 010 4H9V7z',
};

interface SpaceListProps {
  homeId: string;
  spaces: SharedSpace[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onSelectSpace: (space: SharedSpace) => void;
  selectedSpaceId?: string;
}

export function SpaceList({
  homeId,
  spaces,
  isLoading,
  isAdmin,
  onSelectSpace,
  selectedSpaceId,
}: SpaceListProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [slotSize, setSlotSize] = useState('30');

  const createSpaceMutation = useCreateSpace(homeId);
  const deleteSpaceMutation = useDeleteSpace(homeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createSpaceMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        maxDuration: maxDuration ? parseInt(maxDuration) : undefined,
        slotSize: slotSize ? parseInt(slotSize) : 30,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setMaxDuration('');
          setSlotSize('30');
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (confirm('Seguro que quieres eliminar este espacio? Se cancelaran todas las reservas.')) {
      deleteSpaceMutation.mutate(spaceId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Espacios compartidos</h2>
        {isAdmin && (
          <Button
            size="sm"
            variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Nuevo espacio'}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="space-name">Nombre</Label>
                <Input
                  id="space-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lavadora, Cocina, Terraza..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-description">Descripcion (opcional)</Label>
                <Input
                  id="space-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripcion del espacio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="space-max-duration">Duracion maxima (min)</Label>
                  <Input
                    id="space-max-duration"
                    type="number"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    placeholder="Sin limite"
                    min="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="space-slot-size">Tamano de slot (min)</Label>
                  <Input
                    id="space-slot-size"
                    type="number"
                    value={slotSize}
                    onChange={(e) => setSlotSize(e.target.value)}
                    placeholder="30"
                    min="5"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={createSpaceMutation.isPending || !name.trim()}
                className="w-full"
              >
                {createSpaceMutation.isPending ? 'Creando...' : 'Crear espacio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {spaces && spaces.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-3 md:grid-cols-2"
        >
          {spaces.map((space) => {
            const futureReservations = space.reservations?.length || 0;
            const isSelected = selectedSpaceId === space.id;

            return (
              <motion.div
                key={space.id}
                variants={staggerItem}
                whileHover={cardHover}
              >
                <Card
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => onSelectSpace(space)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              SPACE_ICONS[space.icon || ''] ||
                              'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                            }
                          />
                        </svg>
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {space.name}
                      </CardTitle>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, space.id)}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {space.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {space.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
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
                        {futureReservations} reserva{futureReservations !== 1 ? 's' : ''}
                      </span>
                      {space.maxDuration && (
                        <span>Max: {space.maxDuration} min</span>
                      )}
                      <span>Slot: {space.slotSize} min</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-12 h-12 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-muted-foreground">No hay espacios compartidos</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                Crea el primer espacio para empezar a reservar
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
