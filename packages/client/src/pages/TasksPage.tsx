import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TaskStatus, TaskFrequency } from '@conviviapp/shared';
import {
  useTasks,
  useDeleteTask,
  useAssignments,
  useStartAssignment,
  useCompleteAssignment,
  useSkipAssignment,
  useKarmaRanking,
  useCreateAssignment,
  CreateTaskForm,
  AssignmentCard,
} from '@/features/tasks';
import { useHomeMembers } from '@/features/homes';

// El backend devuelve miembros con formato aplanado
interface MemberResponse {
  id: string;
  userId: string;
  name: string;
  role: string;
}
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { PageTransition } from '@/components/ui/page-transition';
import type { Task, TaskAssignment } from '@conviviapp/shared';

type TabId = 'my-tasks' | 'all-assignments' | 'catalog';

const frequencyLabels: Record<string, string> = {
  ONCE: 'Una vez',
  DAILY: 'Diaria',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual',
};

function KarmaCard({ homeId }: { homeId: string }) {
  const { data: ranking, isLoading } = useKarmaRanking(homeId);

  if (isLoading || !ranking?.length) return null;

  const maxKarma = Math.max(...ranking.map((r) => r.karma), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span>Ranking Karma</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ranking.map((entry, index) => (
          <div key={entry.userId} className="flex items-center gap-3">
            <span className="text-lg font-bold w-6 text-center">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{entry.name}</span>
                <span className="text-sm font-bold text-primary">{entry.karma} pts</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((entry.karma / maxKarma) * 100, 2)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-1">
          Completa tareas a tiempo para ganar karma (+dificultad x10, bonus +5 si a tiempo)
        </p>
      </CardContent>
    </Card>
  );
}

function getNextDueDate(frequency: string): Date {
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
    default:
      date.setDate(date.getDate() + 7);
  }
  return date;
}

const frequencyDueDateLabel: Record<string, string> = {
  [TaskFrequency.DAILY]: 'Mañana (se repite cada día)',
  [TaskFrequency.WEEKLY]: 'En 7 días (se repite cada semana)',
  [TaskFrequency.BIWEEKLY]: 'En 14 días (se repite cada 2 semanas)',
  [TaskFrequency.MONTHLY]: 'En 1 mes (se repite cada mes)',
};

function AssignTaskModal({
  task,
  homeId,
  onClose,
}: {
  task: Task;
  homeId: string;
  onClose: () => void;
}) {
  const [assignedToId, setAssignedToId] = useState('');
  const [customDueDate, setCustomDueDate] = useState('');
  const { data: members } = useHomeMembers(homeId);
  const createAssignment = useCreateAssignment(homeId);

  const isRecurring = task.frequency !== TaskFrequency.ONCE;
  const membersList = (members as unknown as MemberResponse[]) || [];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedToId) return;

    const dueDate = isRecurring
      ? getNextDueDate(task.frequency)
      : new Date(customDueDate);

    if (!isRecurring && !customDueDate) return;

    createAssignment.mutate(
      {
        taskId: task.id,
        data: { assignedToId, dueDate },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-lg">Asignar: {task.name}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asignar a</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                required
              >
                <option value="">Seleccionar miembro</option>
                {membersList.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {isRecurring ? (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                📅 {frequencyDueDateLabel[task.frequency]}
              </p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha límite</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  min={minDate}
                  required
                />
              </div>
            )}
          </CardContent>
          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? 'Asignando...' : 'Asignar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TaskCatalogItem({
  task,
  homeId,
}: {
  task: Task;
  homeId: string;
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const deleteMutation = useDeleteTask(homeId);
  const lastAssignment = task.assignments?.[0];

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
          <div className="min-w-0">
            <p className="font-medium truncate">{task.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                {frequencyLabels[task.frequency] || task.frequency}
              </span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < task.difficulty ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
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
              {lastAssignment?.assignedTo && (
                <span>Asignada a: {lastAssignment.assignedTo.name}</span>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAssignModal(true)}
            title="Asignar tarea"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate(task.id)}
            title="Eliminar tarea"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
      {showAssignModal && (
        <AssignTaskModal
          task={task}
          homeId={homeId}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
}

export function TasksPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const [activeTab, setActiveTab] = useState<TabId>('my-tasks');
  const [showForm, setShowForm] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const { data: tasks, isLoading: tasksLoading } = useTasks(homeId!);
  const { data: assignments, isLoading: assignmentsLoading } = useAssignments(homeId!);

  const startMutation = useStartAssignment(homeId!);
  const completeMutation = useCompleteAssignment(homeId!);
  const skipMutation = useSkipAssignment(homeId!);

  const myAssignments = assignments?.filter(
    (a: TaskAssignment) => a.assignedToId === currentUser?.id
  ) || [];

  const pendingAssignments = myAssignments.filter(
    (a: TaskAssignment) => a.status === TaskStatus.PENDING || a.status === TaskStatus.IN_PROGRESS
  );
  const completedAssignments = myAssignments.filter(
    (a: TaskAssignment) => a.status === TaskStatus.COMPLETED
  );
  const skippedAssignments = myAssignments.filter(
    (a: TaskAssignment) => a.status === TaskStatus.SKIPPED
  );

  const allPending = assignments?.filter(
    (a: TaskAssignment) => a.status === TaskStatus.PENDING || a.status === TaskStatus.IN_PROGRESS
  ) || [];
  const allCompleted = assignments?.filter(
    (a: TaskAssignment) => a.status === TaskStatus.COMPLETED || a.status === TaskStatus.SKIPPED
  ) || [];

  const isLoading = tasksLoading || assignmentsLoading;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'my-tasks', label: 'Mis Tareas', count: pendingAssignments.length },
    { id: 'all-assignments', label: 'Todas', count: allPending.length },
    { id: 'catalog', label: 'Catálogo', count: tasks?.length },
  ];

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
          <h1 className="text-xl font-bold">Tareas</h1>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contenido según pestaña */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* ===== MIS TAREAS ===== */}
              {activeTab === 'my-tasks' && (
                <div className="space-y-6">
                  <KarmaCard homeId={homeId!} />

                  {pendingAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Pendientes ({pendingAssignments.length})
                      </h3>
                      <AnimatedList>
                        {pendingAssignments.map((a: TaskAssignment) => (
                          <AnimatedListItem key={a.id} layoutId={a.id}>
                            <AssignmentCard
                              assignment={a as TaskAssignment & { task?: { name: string; difficulty: number } }}
                              isCurrentUser
                              onStart={(id) => startMutation.mutate(id)}
                              onComplete={(id, notes) => completeMutation.mutate({ assignmentId: id, notes })}
                              onSkip={(id, notes) => skipMutation.mutate({ assignmentId: id, notes })}
                            />
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                    </div>
                  )}

                  {completedAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Completadas ({completedAssignments.length})
                      </h3>
                      <AnimatedList>
                        {completedAssignments.slice(0, 5).map((a: TaskAssignment) => (
                          <AnimatedListItem key={a.id} layoutId={a.id}>
                            <AssignmentCard
                              assignment={a as TaskAssignment & { task?: { name: string; difficulty: number } }}
                              isCurrentUser
                            />
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                    </div>
                  )}

                  {skippedAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Omitidas ({skippedAssignments.length})
                      </h3>
                      <AnimatedList>
                        {skippedAssignments.slice(0, 3).map((a: TaskAssignment) => (
                          <AnimatedListItem key={a.id} layoutId={a.id}>
                            <AssignmentCard
                              assignment={a as TaskAssignment & { task?: { name: string; difficulty: number } }}
                              isCurrentUser
                            />
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                    </div>
                  )}

                  {myAssignments.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <span className="text-4xl mb-3">🎉</span>
                        <p className="text-muted-foreground font-medium">No tienes tareas asignadas</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ve al catálogo para crear y asignar tareas
                        </p>
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => setActiveTab('catalog')}
                        >
                          Ir al catálogo
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ===== TODAS LAS ASIGNACIONES ===== */}
              {activeTab === 'all-assignments' && (
                <div className="space-y-6">
                  {allPending.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Activas ({allPending.length})
                      </h3>
                      <AnimatedList>
                        {allPending.map((a: TaskAssignment) => (
                          <AnimatedListItem key={a.id} layoutId={a.id}>
                            <AssignmentCard
                              assignment={a as TaskAssignment & { task?: { name: string; difficulty: number } }}
                              isCurrentUser={a.assignedToId === currentUser?.id}
                              onStart={(id) => startMutation.mutate(id)}
                              onComplete={(id, notes) => completeMutation.mutate({ assignmentId: id, notes })}
                              onSkip={(id, notes) => skipMutation.mutate({ assignmentId: id, notes })}
                            />
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                    </div>
                  )}

                  {allCompleted.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Historial ({allCompleted.length})
                      </h3>
                      <AnimatedList>
                        {allCompleted.slice(0, 10).map((a: TaskAssignment) => (
                          <AnimatedListItem key={a.id} layoutId={a.id}>
                            <AssignmentCard
                              assignment={a as TaskAssignment & { task?: { name: string; difficulty: number } }}
                              isCurrentUser={a.assignedToId === currentUser?.id}
                            />
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                    </div>
                  )}

                  {(!assignments || assignments.length === 0) && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <span className="text-4xl mb-3">📋</span>
                        <p className="text-muted-foreground">No hay asignaciones en este hogar</p>
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => setActiveTab('catalog')}
                        >
                          Crear y asignar tareas
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ===== CATÁLOGO DE TAREAS ===== */}
              {activeTab === 'catalog' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Catálogo de tareas</h2>
                    <Button size="sm" onClick={() => setShowForm(!showForm)}>
                      {showForm ? 'Cancelar' : 'Nueva tarea'}
                    </Button>
                  </div>

                  {showForm && (
                    <CreateTaskForm homeId={homeId!} onSuccess={() => setShowForm(false)} />
                  )}

                  {tasks && tasks.length > 0 ? (
                    <AnimatedList>
                      {tasks.map((task: Task) => (
                        <AnimatedListItem key={task.id} layoutId={task.id}>
                          <TaskCatalogItem task={task} homeId={homeId!} />
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        <p className="text-muted-foreground">No hay tareas en este hogar</p>
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => setShowForm(true)}
                        >
                          Crear la primera tarea
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
