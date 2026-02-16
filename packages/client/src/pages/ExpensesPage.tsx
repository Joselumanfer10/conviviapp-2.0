import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useExpenses,
  useBalances,
  useDeleteExpense,
  ExpenseCard,
  CreateExpenseForm,
  BalanceList,
} from '@/features/expenses';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { PageTransition } from '@/components/ui/page-transition';

export function ExpensesPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);
  const [showForm, setShowForm] = useState(false);

  const { data: expenses, isLoading: loadingExpenses } = useExpenses(homeId!);
  const { data: balances, isLoading: loadingBalances } = useBalances(homeId!);
  const deleteExpenseMutation = useDeleteExpense(homeId!);

  const handleDelete = (expenseId: string) => {
    if (confirm('Eliminar este gasto?')) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={`/homes/${homeId}`}>
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
          <h1 className="text-xl font-bold">Gastos</h1>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Historial de gastos</h2>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancelar' : 'Nuevo gasto'}
              </Button>
            </div>

            {showForm && (
              <CreateExpenseForm
                homeId={homeId!}
                onSuccess={() => setShowForm(false)}
              />
            )}

            {loadingExpenses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : expenses && expenses.length > 0 ? (
              <AnimatedList>
                {expenses.map((expense) => (
                  <AnimatedListItem key={expense.id} layoutId={expense.id}>
                    <ExpenseCard
                      expense={expense}
                      onDelete={handleDelete}
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <svg
                    className="w-12 h-12 text-muted-foreground mb-4"
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
                  <p className="text-muted-foreground">No hay gastos todavia</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setShowForm(true)}
                  >
                    Registrar el primer gasto
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balances</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBalances ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : balances && balances.length > 0 ? (
                  <BalanceList balances={balances} />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay balances
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </main>
  );
}
