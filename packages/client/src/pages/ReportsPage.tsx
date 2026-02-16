import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useMonthlyReport,
  MonthSelector,
  ReportSummaryCards,
  ExpenseBreakdownChart,
  TaskCompletionChart,
  KarmaEvolutionChart,
} from '@/features/reports';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';

export function ReportsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: report, isLoading } = useMonthlyReport(homeId!, month, year);

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNext = () => {
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/homes/${homeId}`}>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Reportes mensuales</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </Button>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-6 space-y-6">
        <MonthSelector
          month={month}
          year={year}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !report ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se pudo cargar el reporte</p>
          </div>
        ) : (
          <>
            <ReportSummaryCards report={report} />
            <ExpenseBreakdownChart expenses={report.expenses} />
            <div className="grid gap-4 md:grid-cols-2">
              <TaskCompletionChart tasks={report.tasks} />
              <KarmaEvolutionChart karma={report.karma} />
            </div>
          </>
        )}
      </PageTransition>
    </main>
  );
}
