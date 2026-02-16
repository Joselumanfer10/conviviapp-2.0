import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Pagina no encontrada
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          La pagina que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </main>
  );
}
