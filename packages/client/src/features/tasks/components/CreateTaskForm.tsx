import { useState, useMemo } from 'react';
import { TaskFrequency } from '@conviviapp/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateTask, useCreateAssignment } from '../hooks/useTasks';
import { useHomeMembers } from '@/features/homes';
import type { AxiosError } from 'axios';

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface CreateTaskFormProps {
  homeId: string;
  onSuccess?: () => void;
}

const difficultyLabels = ['Muy fácil', 'Fácil', 'Normal', 'Difícil', 'Muy difícil'];

const frequencyDueDateLabel: Record<string, string> = {
  [TaskFrequency.DAILY]: 'Mañana (se repite cada día)',
  [TaskFrequency.WEEKLY]: 'En 7 días (se repite cada semana)',
  [TaskFrequency.BIWEEKLY]: 'En 14 días (se repite cada 2 semanas)',
  [TaskFrequency.MONTHLY]: 'En 1 mes (se repite cada mes)',
};

function getNextDueDate(frequency: TaskFrequency): Date {
  const date = new Date();
  switch (frequency) {
    case TaskFrequency.DAILY:
      date.setDate(date.getDate() + 1);
      break;
    case TaskFrequency.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;
    case TaskFrequency.BIWEEKLY:
      date.setDate(date.getDate() + 14);
      break;
    case TaskFrequency.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case TaskFrequency.ONCE:
    default:
      date.setDate(date.getDate() + 7);
  }
  return date;
}

// El backend devuelve miembros con formato aplanado: { userId, name, ... }
interface MemberResponse {
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role: string;
  nickname?: string | null;
}

export function CreateTaskForm({ homeId, onSuccess }: CreateTaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<TaskFrequency>(TaskFrequency.WEEKLY);
  const [difficulty, setDifficulty] = useState(1);
  const [assignedToId, setAssignedToId] = useState('');
  const [customDueDate, setCustomDueDate] = useState('');

  const createTaskMutation = useCreateTask(homeId);
  const createAssignmentMutation = useCreateAssignment(homeId);
  const { data: members } = useHomeMembers(homeId);

  const isRecurring = frequency !== TaskFrequency.ONCE;

  const autoDueDate = useMemo(() => getNextDueDate(frequency), [frequency]);

  const effectiveDueDate = isRecurring
    ? autoDueDate
    : customDueDate ? new Date(customDueDate) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(
      {
        name,
        description: description || undefined,
        frequency,
        difficulty,
      },
      {
        onSuccess: (task) => {
          if (assignedToId && effectiveDueDate) {
            createAssignmentMutation.mutate(
              {
                taskId: task.id,
                data: {
                  assignedToId,
                  dueDate: effectiveDueDate,
                },
              },
              {
                onSuccess: () => {
                  resetForm();
                  onSuccess?.();
                },
              }
            );
          } else {
            resetForm();
            onSuccess?.();
          }
        },
      }
    );
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setFrequency(TaskFrequency.WEEKLY);
    setDifficulty(1);
    setAssignedToId('');
    setCustomDueDate('');
  };

  const isPending = createTaskMutation.isPending || createAssignmentMutation.isPending;
  const error = (createTaskMutation.error || createAssignmentMutation.error) as AxiosError<ApiError> | null;
  const errorMessage = error?.response?.data?.error?.message || error?.message;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Cast members a la estructura real de la API
  const membersList = (members as unknown as MemberResponse[]) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nueva tarea</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la tarea</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Limpiar cocina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Descripción de la tarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia</Label>
              <select
                id="frequency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                disabled={isPending}
              >
                <option value={TaskFrequency.ONCE}>Una vez</option>
                <option value={TaskFrequency.DAILY}>Diaria</option>
                <option value={TaskFrequency.WEEKLY}>Semanal</option>
                <option value={TaskFrequency.BIWEEKLY}>Quincenal</option>
                <option value={TaskFrequency.MONTHLY}>Mensual</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dificultad</Label>
              <div className="flex items-center gap-1 h-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDifficulty(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                    title={difficultyLabels[star - 1]}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        star <= difficulty
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/30'
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
                  </button>
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {difficultyLabels[difficulty - 1]}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Asignación inicial (opcional)</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Asignar a</Label>
                <select
                  id="assignedTo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">Sin asignar</option>
                  {membersList.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {assignedToId && isRecurring && (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                  📅 {frequencyDueDateLabel[frequency]}
                </p>
              )}

              {assignedToId && !isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                    min={minDate}
                    required
                    disabled={isPending}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || (!!assignedToId && !isRecurring && !customDueDate)}
          >
            {isPending ? 'Creando...' : assignedToId ? 'Crear y asignar tarea' : 'Crear tarea'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
