import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useHouseRules, useAcceptHouseRule, useDeleteHouseRule } from '@/features/rules';
import { RuleCard } from '@/features/rules/components/RuleCard';
import { CreateRuleForm } from '@/features/rules/components/CreateRuleForm';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';

export function RulesPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);
  const { user } = useAuthStore();
  const { data: rules, isLoading } = useHouseRules(homeId!);
  const acceptMutation = useAcceptHouseRule(homeId!);
  const deleteMutation = useDeleteHouseRule(homeId!);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...new Set(rules?.map((r) => r.category) || [])];

  const filteredRules = rules?.filter(
    (r) => filterCategory === 'all' || r.category === filterCategory
  );

  const CATEGORY_LABELS: Record<string, string> = {
    all: 'Todas',
    convivencia: 'Convivencia',
    limpieza: 'Limpieza',
    ruido: 'Ruido',
    visitas: 'Visitas',
    espacios: 'Espacios',
    gastos: 'Gastos',
    general: 'General',
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
            <h1 className="text-xl font-bold">Reglas del hogar</h1>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            size="sm"
          >
            {showForm ? 'Cancelar' : 'Nueva regla'}
          </Button>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-6 space-y-6">
        {showForm && (
          <CreateRuleForm
            homeId={homeId!}
            onSuccess={() => setShowForm(false)}
          />
        )}

        {/* Filtros por categoria */}
        {categories.length > 2 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !filteredRules || filteredRules.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground">No hay reglas todavia</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea la primera regla del hogar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  homeId={homeId!}
                  currentUserId={user?.id || ''}
                  onAccept={(ruleId) => acceptMutation.mutate(ruleId)}
                  onDelete={(ruleId) => deleteMutation.mutate(ruleId)}
                  isAccepting={acceptMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </PageTransition>
    </main>
  );
}
