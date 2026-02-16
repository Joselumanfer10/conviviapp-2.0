import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">ConviviApp</h1>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesion
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Gestion integral de pisos compartidos
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Gastos, tareas, compras y mas. Todo en un solo lugar para que la
              convivencia sea facil y sin conflictos.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register">
                <Button size="lg">Comenzar gratis</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">Gastos compartidos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Registra gastos y ve quien debe a quien. Simplificacion
                automatica de deudas.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">Tareas rotativas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Organiza las tareas del hogar con rotacion automatica y
                recordatorios.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">Lista de compras</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lista compartida en tiempo real. Nunca mas compras duplicadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-muted/30 border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          ConviviApp - TFM Master en Desarrollo con IA
        </div>
      </footer>
    </main>
  );
}
