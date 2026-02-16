import { motion } from 'framer-motion';
import type { HouseRule } from '@conviviapp/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AcceptanceIndicator } from './AcceptanceIndicator';

interface RuleCardProps {
  rule: HouseRule;
  homeId: string;
  currentUserId: string;
  onAccept: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  isAccepting?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  convivencia: 'Convivencia',
  limpieza: 'Limpieza',
  ruido: 'Ruido',
  visitas: 'Visitas',
  espacios: 'Espacios',
  gastos: 'Gastos',
  general: 'General',
};

const PRIORITY_CONFIG: Record<number, { label: string; color: string; border: string }> = {
  0: { label: 'Normal', color: 'bg-muted text-muted-foreground', border: '' },
  1: { label: 'Importante', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', border: 'border-l-yellow-500' },
  2: { label: 'Critica', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', border: 'border-l-red-500' },
};

export function RuleCard({ rule, homeId, currentUserId, onAccept, onDelete, isAccepting }: RuleCardProps) {
  const hasAccepted = rule.acceptedBy.includes(currentUserId);
  const isAuthor = rule.createdById === currentUserId;
  const priorityCfg = PRIORITY_CONFIG[rule.priority] || PRIORITY_CONFIG[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className={`${priorityCfg.border ? `border-l-4 ${priorityCfg.border}` : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">{rule.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {CATEGORY_LABELS[rule.category] || rule.category}
                </span>
                {rule.priority > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityCfg.color}`}>
                    {priorityCfg.label}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!hasAccepted && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAccept(rule.id)}
                  disabled={isAccepting}
                  className="h-8"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aceptar
                </Button>
              )}
              {hasAccepted && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aceptada
                </span>
              )}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(rule.id)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rule.description}</p>
          <AcceptanceIndicator homeId={homeId} acceptedBy={rule.acceptedBy} />
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>Creada por {(rule as any).createdBy?.name || 'Desconocido'}</span>
            <span>{new Date(rule.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
