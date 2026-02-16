import { Bell, DollarSign, CheckSquare, ShoppingCart, Megaphone, Users } from 'lucide-react';
import type { Notification } from '@conviviapp/shared';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

function getIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('gasto') || lower.includes('liquidaci') || lower.includes('pago')) return DollarSign;
  if (lower.includes('tarea')) return CheckSquare;
  if (lower.includes('compr') || lower.includes('artículo') || lower.includes('articulo')) return ShoppingCart;
  if (lower.includes('anuncio')) return Megaphone;
  if (lower.includes('miembro')) return Users;
  return Bell;
}

function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `hace ${diffDays}d`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = getIcon(notification.title);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-0',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'mt-0.5 p-1.5 rounded-full shrink-0',
          !notification.isRead
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-tight', !notification.isRead && 'font-medium')}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}
