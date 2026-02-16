import { TaskStatus, type TaskAssignment } from '@conviviapp/shared';

interface TaskCardProps {
  assignment: TaskAssignment;
  onStatusChange?: (assignmentId: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TaskStatus.SKIPPED]: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  [TaskStatus.PENDING]: 'Pendiente',
  [TaskStatus.IN_PROGRESS]: 'En progreso',
  [TaskStatus.COMPLETED]: 'Completada',
  [TaskStatus.SKIPPED]: 'Omitida',
};

export function TaskCard({ assignment, onStatusChange }: TaskCardProps) {
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(assignment.dueDate));

  const isOverdue =
    assignment.status === TaskStatus.PENDING &&
    new Date(assignment.dueDate) < new Date();

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary"
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
        <div>
          <p className="font-medium">
            {(assignment as TaskAssignment & { task?: { name: string } }).task?.name ||
              'Tarea'}
          </p>
          <p
            className={`text-sm ${
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {assignment.assignedTo?.name || 'Sin asignar'} - Vence: {formattedDate}
            {isOverdue && ' (Vencida)'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[assignment.status]
          }`}
        >
          {statusLabels[assignment.status]}
        </span>
        {onStatusChange && assignment.status !== TaskStatus.COMPLETED && (
          <button
            onClick={() =>
              onStatusChange(
                assignment.id,
                assignment.status === TaskStatus.PENDING
                  ? TaskStatus.IN_PROGRESS
                  : TaskStatus.COMPLETED
              )
            }
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
            title={
              assignment.status === TaskStatus.PENDING
                ? 'Iniciar'
                : 'Completar'
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
