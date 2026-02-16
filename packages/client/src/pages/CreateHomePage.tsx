import { Link } from 'react-router-dom';
import { CreateHomeForm } from '@/features/homes';
import { Button } from '@/components/ui/button';

export function CreateHomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
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
          <h1 className="text-xl font-bold text-primary">ConviviApp</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex justify-center">
        <CreateHomeForm />
      </div>
    </main>
  );
}
