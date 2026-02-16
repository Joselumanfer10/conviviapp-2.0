import { usePWA } from '@/hooks/usePWA';
import { Button } from './button';

export function PWAUpdatePrompt() {
  const { needRefresh, updateServiceWorker, close } = usePWA();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg">
      <p className="text-sm font-medium">
        Nueva versión disponible
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Actualiza para obtener las últimas mejoras.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Actualizar
        </Button>
        <Button size="sm" variant="outline" onClick={close}>
          Después
        </Button>
      </div>
    </div>
  );
}
