import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HomeRole } from '@conviviapp/shared';
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useTogglePin,
  useCastVote,
  useRemoveVote,
  AnnouncementCard,
  CreateAnnouncementForm,
} from '@/features/announcements';
import { useHomeMembers } from '@/features/homes';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { PageTransition } from '@/components/ui/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type FilterTab = 'all' | 'info' | 'polls';

export function AnnouncementsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const { user } = useAuthStore();
  const { data: members } = useHomeMembers(homeId!);
  const { data: announcements, isLoading } = useAnnouncements(homeId!);
  const deleteMutation = useDeleteAnnouncement(homeId!);
  const togglePinMutation = useTogglePin(homeId!);
  const castVoteMutation = useCastVote(homeId!);
  const removeVoteMutation = useRemoveVote(homeId!);

  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const currentMember = members?.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === HomeRole.ADMIN;

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];

    let filtered = [...announcements];

    if (activeFilter === 'info') {
      filtered = filtered.filter((a) => a.type === 'INFO');
    } else if (activeFilter === 'polls') {
      filtered = filtered.filter((a) => a.type === 'POLL' || a.type === 'VOTE');
    }

    // Fijados primero, luego por fecha descendente
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [announcements, activeFilter]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleTogglePin = (id: string) => {
    togglePinMutation.mutate(id);
  };

  const handleCastVote = (id: string, optionIndex: number) => {
    castVoteMutation.mutate({ id, data: { optionIndex } });
  };

  const handleRemoveVote = (id: string) => {
    removeVoteMutation.mutate(id);
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'info', label: 'Anuncios' },
    { key: 'polls', label: 'Encuestas' },
  ];

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
            <h1 className="text-xl font-bold">Tablon</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Boton para mostrar/ocultar formulario */}
          <Button
            variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm(!showForm)}
            className="w-full"
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
                Nuevo anuncio
              </span>
            )}
          </Button>

          {/* Formulario colapsable */}
          {showForm && (
            <CreateAnnouncementForm
              homeId={homeId!}
              onSuccess={() => setShowForm(false)}
            />
          )}

          {/* Filtros */}
          <div className="flex items-center gap-2 border-b pb-3">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lista de anuncios */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <AnimatedList>
              {filteredAnnouncements.map((announcement) => (
                <AnimatedListItem key={announcement.id} layoutId={announcement.id}>
                  <AnnouncementCard
                    announcement={announcement}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onCastVote={handleCastVote}
                    onRemoveVote={handleRemoveVote}
                    isAdmin={isAdmin}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="w-16 h-16 text-muted-foreground/50 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <p className="text-muted-foreground font-medium mb-1">
                No hay anuncios
              </p>
              <p className="text-sm text-muted-foreground/70">
                Crea el primer anuncio para tu hogar
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
