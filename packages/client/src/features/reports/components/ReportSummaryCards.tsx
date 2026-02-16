import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import type { MonthlyReport } from '@conviviapp/shared';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

interface ReportSummaryCardsProps {
  report: MonthlyReport;
}

export function ReportSummaryCards({ report }: ReportSummaryCardsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={staggerItem} whileHover={cardHover}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={report.expenses.total} decimals={2} suffix=" €" className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground mt-1">{report.expenses.count} gastos registrados</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={cardHover}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Media por miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedNumber
              value={report.expenses.byMember.length > 0 ? report.expenses.total / report.expenses.byMember.length : 0}
              decimals={2}
              suffix=" €"
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground mt-1">{report.expenses.byMember.length} miembros</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={cardHover}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tareas completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={report.tasks.totalCompleted} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground mt-1">de {report.tasks.totalAssigned} asignadas</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={cardHover}>
        <Card className={report.tasks.completionRate >= 80 ? 'border-green-500/50' : report.tasks.completionRate >= 50 ? 'border-yellow-500/50' : 'border-red-500/50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={report.tasks.completionRate} suffix="%" className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground mt-1">
              {report.tasks.completionRate >= 80 ? 'Excelente' : report.tasks.completionRate >= 50 ? 'Mejorable' : 'Necesita atencion'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
