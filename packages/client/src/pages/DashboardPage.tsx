import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/features/auth';
import { useHomes, HomeCard } from '@/features/homes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function DashboardPage() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: homes, isLoading } = useHomes();

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">ConviviApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hola, {user?.name}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Cerrar sesion
            </Button>
          </div>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Mis hogares</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {homes?.map((home) => (
              <motion.div key={home.id} variants={staggerItem}>
                <HomeCard home={home} />
              </motion.div>
            ))}

            <motion.div variants={staggerItem}>
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    <Link to="/homes/create">
                      <Button className="w-full" size="sm">
                        Crear hogar
                      </Button>
                    </Link>
                    <Link to="/homes/join">
                      <Button variant="outline" className="w-full" size="sm">
                        Unirme a uno
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </PageTransition>
    </main>
  );
}
