import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useHome, useHomeMembers } from '@/features/homes';
import { useLogout } from '@/features/auth';
import { useExpenses, useBalances, useSettlements } from '@/features/expenses';
import { useTasks, useKarmaRanking } from '@/features/tasks';
import { useShoppingItems } from '@/features/shopping';
import { useAnnouncements } from '@/features/announcements';
import { NotificationBell } from '@/features/notifications';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { PageTransition } from '@/components/ui/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  ExpensesByPayerChart,
  MonthlyExpensesChart,
  KarmaRankingChart,
  ActivityFeed,
} from '@/features/dashboard';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

export function HomeDashboardPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);
  const { user } = useAuthStore();
  const { data: home, isLoading } = useHome(homeId!);
  const { data: members } = useHomeMembers(homeId!);
  const { data: expenses } = useExpenses(homeId!);
  const { data: balances } = useBalances(homeId!);
  const { data: settlements } = useSettlements(homeId!);
  const { data: tasks } = useTasks(homeId!);
  const { data: karmaRanking } = useKarmaRanking(homeId!);
  const { data: shoppingItems } = useShoppingItems(homeId!);
  const { data: announcements } = useAnnouncements(homeId!);
  const logoutMutation = useLogout();

  // Mi balance personal
  const myBalance = balances?.find((b) => b.user?.id === user?.id);
  const balanceAmount = myBalance?.balance || 0;

  // Liquidaciones pendientes de confirmar (donde yo soy receptor)
  const pendingSettlements = settlements?.filter(
    (s) => s.status === 'PENDING' && s.toUser?.id === user?.id
  ).length || 0;

  // Mi karma
  const myKarma = karmaRanking?.find((k) => k.odUserId === user?.id);

  // Gastos este mes
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const expensesThisMonth = expenses?.filter((e) => {
    const date = new Date(e.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length || 0;

  // Mis tareas pendientes
  const myPendingTasks = tasks?.filter((t) =>
    t.assignments?.some((a) => a.status === 'PENDING' && a.assignedTo?.id === user?.id)
  ).length || 0;

  // Items de compras pendientes
  const pendingItems = shoppingItems?.filter((i) => i.status === 'PENDING').length || 0;

  // Anuncios activos
  const activeAnnouncements = announcements?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Hogar no encontrado</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                Mis hogares
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{home.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hola, {user?.name}
            </span>
            <NotificationBell />
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
        {/* KPIs Personales */}
        <h2 className="text-lg font-semibold mb-4">Tu resumen</h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {/* Balance Personal */}
          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Card className={balanceAmount > 0 ? 'border-green-500/50' : balanceAmount < 0 ? 'border-red-500/50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mi Balance</CardTitle>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </CardHeader>
              <CardContent>
                <AnimatedNumber
                  value={balanceAmount}
                  decimals={2}
                  prefix={balanceAmount > 0 ? '+' : ''}
                  suffix=" €"
                  className={`text-2xl font-bold ${balanceAmount > 0 ? 'text-green-500' : balanceAmount < 0 ? 'text-red-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  {balanceAmount > 0 ? 'Te deben' : balanceAmount < 0 ? 'Debes' : 'Equilibrado'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Liquidaciones Pendientes */}
          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Card className={pendingSettlements > 0 ? 'border-yellow-500/50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Por confirmar</CardTitle>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <AnimatedNumber
                  value={pendingSettlements}
                  className={`text-2xl font-bold ${pendingSettlements > 0 ? 'text-yellow-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground">pagos por confirmar</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mis Tareas */}
          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Card className={myPendingTasks > 0 ? 'border-blue-500/50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mis Tareas</CardTitle>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </CardHeader>
              <CardContent>
                <AnimatedNumber
                  value={myPendingTasks}
                  className={`text-2xl font-bold ${myPendingTasks > 0 ? 'text-blue-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground">tareas asignadas</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mi Karma */}
          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mi Karma</CardTitle>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </CardHeader>
              <CardContent>
                <AnimatedNumber value={myKarma?.karma || 0} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">
                  {myKarma?.rank ? `#${myKarma.rank} en el hogar` : 'puntos de participacion'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Accesos Rapidos */}
        <h2 className="text-lg font-semibold mb-4">Accesos rapidos</h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 mb-8"
        >
          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/expenses`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <AnimatedNumber value={expensesThisMonth} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">gastos este mes</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/tasks`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tareas</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <AnimatedNumber value={tasks?.length || 0} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">tareas del hogar</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/shopping`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Compras</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <AnimatedNumber value={pendingItems} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">items pendientes</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/announcements`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tablon</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <AnimatedNumber value={activeAnnouncements} className="text-2xl font-bold" />
                  <p className="text-xs text-muted-foreground">anuncios activos</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/calendar`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Calendario</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {new Date().toLocaleDateString('es-ES', { day: 'numeric' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('es-ES', { month: 'short' })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/reservations`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    <svg className="w-6 h-6 inline text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </p>
                  <p className="text-xs text-muted-foreground">espacios compartidos</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/reports`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reportes</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    <svg className="w-6 h-6 inline text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </p>
                  <p className="text-xs text-muted-foreground">ver estadisticas</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Link to={`/homes/${homeId}/rules`}>
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reglas</CardTitle>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    <svg className="w-6 h-6 inline text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </p>
                  <p className="text-xs text-muted-foreground">reglas del hogar</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} whileHover={cardHover}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Miembros</CardTitle>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <AnimatedNumber value={members?.length || 0} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">companeros de piso</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <h2 className="text-lg font-semibold mb-4">Estadisticas</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid gap-4 md:grid-cols-2 mb-8"
        >
          <ExpensesByPayerChart balances={balances} />
          <MonthlyExpensesChart expenses={expenses} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="grid gap-4 md:grid-cols-2 mb-8"
        >
          <ActivityFeed homeId={homeId} />
          <KarmaRankingChart ranking={karmaRanking} />
        </motion.div>

        {/* Codigo de Invitacion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Codigo de invitacion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <code className="bg-muted px-4 py-2 rounded-md font-mono text-lg">
                  {home.inviteCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(home.inviteCode);
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Comparte este codigo con tus companeros para que se unan al hogar.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </PageTransition>
    </main>
  );
}
