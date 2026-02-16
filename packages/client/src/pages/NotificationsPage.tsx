import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { staggerContainer, staggerItem } from '@/lib/animations';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  NotificationItem,
} from '@/features/notifications';

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const isReadFilter =
    filter === 'unread' ? false : filter === 'read' ? true : undefined;
  const { data: notifData, isLoading } = useNotifications({ isRead: isReadFilter });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notifData?.notifications ?? [];

  const handleClick = (id: string, link?: string, isRead?: boolean) => {
    if (!isRead) markAsRead.mutate(id);
    if (link) navigate(link);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'unread', label: 'No leidas' },
    { key: 'read', label: 'Leidas' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Notificaciones</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            Cargando...
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">Sin notificaciones</p>
              <p className="text-sm mt-1">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No hay notificaciones aun'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {notifications.map((notif) => (
              <motion.div key={notif.id} variants={staggerItem}>
                <Card className="overflow-hidden">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <NotificationItem
                        notification={notif}
                        onClick={() =>
                          handleClick(notif.id, notif.link, notif.isRead)
                        }
                      />
                    </div>
                    <div className="pr-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification.mutate(notif.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
