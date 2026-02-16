import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)} title={isConnected ? 'Conectado en tiempo real' : 'Reconectando...'}>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {isConnected ? 'En vivo' : 'Sin conexión'}
      </span>
    </div>
  );
}
