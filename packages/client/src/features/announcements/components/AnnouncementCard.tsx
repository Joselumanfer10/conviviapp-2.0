import { motion } from 'framer-motion';
import type { Announcement, AnnouncementType } from '@conviviapp/shared';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staggerItem } from '@/lib/animations';
import { VotePanel } from './VotePanel';

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onCastVote?: (id: string, optionIndex: number) => void;
  onRemoveVote?: (id: string) => void;
  isAdmin?: boolean;
}

const typeConfig: Record<AnnouncementType, { label: string; color: string }> = {
  INFO: { label: 'Anuncio', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  POLL: { label: 'Encuesta', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  VOTE: { label: 'Votacion', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function AnnouncementCard({
  announcement,
  onDelete,
  onTogglePin,
  onCastVote,
  onRemoveVote,
  isAdmin = false,
}: AnnouncementCardProps) {
  const { user } = useAuthStore();
  const isAuthor = user?.id === announcement.authorId;
  const canDelete = isAuthor || isAdmin;
  const canPin = isAdmin;
  const config = typeConfig[announcement.type];
  const isExpired = announcement.expiresAt
    ? new Date(announcement.expiresAt) < new Date()
    : false;

  return (
    <motion.div variants={staggerItem}>
      <Card className={`transition-all ${announcement.isPinned ? 'border-primary/50 shadow-sm' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Fijado
                  </span>
                )}
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                {isExpired && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Cerrada
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-base leading-tight">
                {announcement.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {canPin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onTogglePin?.(announcement.id)}
                  title={announcement.isPinned ? 'Desfijar' : 'Fijar'}
                >
                  <svg
                    className={`w-4 h-4 ${announcement.isPinned ? 'text-primary' : 'text-muted-foreground'}`}
                    fill={announcement.isPinned ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete?.(announcement.id)}
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="font-medium">{announcement.author?.name || 'Desconocido'}</span>
            <span>-</span>
            <span>{formatRelativeDate(announcement.createdAt)}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-3 mb-3">
            {announcement.content}
          </p>

          {(announcement.type === 'POLL' || announcement.type === 'VOTE') &&
            announcement.options &&
            announcement.options.length > 0 && (
              <VotePanel
                announcement={announcement}
                isExpired={isExpired}
                onCastVote={onCastVote}
                onRemoveVote={onRemoveVote}
              />
            )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
