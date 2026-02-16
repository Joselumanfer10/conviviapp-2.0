import { useState } from 'react';
import { TaskStatus, type TaskAssignment } from '@conviviapp/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AssignmentCardProps {
  assignment: TaskAssignment & { task?: { name: string; difficulty: number } };
  onStart?: (assignmentId: string) => void;
  onComplete?: (assignmentId: string, notes?: string) => void;
  onSkip?: (assignmentId: string, notes?: string) => void;
  isCurrentUser?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  [TaskStatus.PENDING]: {
    label: 'Pendiente',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: '⏳',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'En progreso',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: '🔄',
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completada',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: '✅',
  },
  [TaskStatus.SKIPPED]: {
    label: 'Omitida',
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    icon: '⏭️',
  },
};

export function AssignmentCard({
  assignment,
  onStart,
  onComplete,
  onSkip,
  isCurrentUser,
}: AssignmentCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const status = statusConfig[assignment.status] || statusConfig[TaskStatus.PENDING];
  const taskName = assignment.task?.name || 'Tarea';
  const difficulty = assignment.task?.difficulty || 1;

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(assignment.dueDate));

  const isOverdue =
    assignment.status !== TaskStatus.COMPLETED &&
    assignment.status !== TaskStatus.SKIPPED &&
    new Date(assignment.dueDate) < new Date();

  const karmaOnComplete = difficulty * 10 + (isOverdue ? 0 : 5);
  const karmaOnSkip = difficulty * -5;

  const handleComplete = () => {
    if (showNotes) {
      onComplete?.(assignment.id, notes || undefined);
      toast.success(`+${karmaOnComplete} karma`, { description: `Tarea "${taskName}" completada` });
      setShowNotes(false);
      setNotes('');
    } else {
      setShowNotes(true);
    }
  };

  const handleSkip = () => {
    onSkip?.(assignment.id, notes || undefined);
    toast.error(`${karmaOnSkip} karma`, { description: `Tarea "${taskName}" omitida` });
    setShowNotes(false);
    setNotes('');
  };

  return (
    <div className="p-4 bg-card rounded-lg border space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg">
            {status.icon}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{taskName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                {isOverdue ? '⚠ Vencida: ' : 'Vence: '}
                {formattedDate}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < difficulty ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                ))}
              </span>
              {assignment.assignedTo && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{assignment.assignedTo.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Notas existentes */}
      {assignment.notes && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
          {assignment.notes}
        </p>
      )}

      {/* Acciones según estado */}
      {isCurrentUser && (
        <div className="flex items-center gap-2 pt-1">
          {assignment.status === TaskStatus.PENDING && (
            <>
              <Button
                size="sm"
                onClick={() => onStart?.(assignment.id)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleSkip}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Omitir ({karmaOnSkip})
              </Button>
            </>
          )}
          {assignment.status === TaskStatus.IN_PROGRESS && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleComplete}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {showNotes ? 'Confirmar' : `Completar (+${karmaOnComplete})`}
              </Button>
              {!showNotes && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStart?.(assignment.id)}
                >
                  Pausar
                </Button>
              )}
            </>
          )}
          {assignment.status === TaskStatus.SKIPPED && (
            <span className="text-xs text-muted-foreground">
              Karma: {karmaOnSkip} pts
            </span>
          )}
          {assignment.status === TaskStatus.COMPLETED && assignment.completedAt && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Completada el{' '}
              {new Intl.DateTimeFormat('es-ES', {
                day: 'numeric',
                month: 'short',
              }).format(new Date(assignment.completedAt))}
              {' '}(+{karmaOnComplete} karma)
            </span>
          )}
        </div>
      )}

      {/* Input notas al completar */}
      {showNotes && (
        <div className="flex gap-2">
          <Input
            placeholder="Notas opcionales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowNotes(false);
              setNotes('');
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
