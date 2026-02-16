import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import {
  useHome,
  useHomeMembers,
  useUpdateHome,
  useDeleteHome,
  useLeaveHome,
  useRegenerateInviteCode,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/features/homes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/ui/page-transition';
import { toast } from 'sonner';

export function HomeSettingsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const { user } = useAuthStore();
  const { data: home, isLoading: loadingHome } = useHome(homeId!);
  const { data: members, isLoading: loadingMembers } = useHomeMembers(homeId!);

  const updateHomeMutation = useUpdateHome(homeId!);
  const deleteHomeMutation = useDeleteHome();
  const leaveHomeMutation = useLeaveHome();
  const regenerateCodeMutation = useRegenerateInviteCode(homeId!);
  const updateRoleMutation = useUpdateMemberRole(homeId!);
  const removeMemberMutation = useRemoveMember(homeId!);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [formInitialized, setFormInitialized] = useState(false);
  const [copied, setCopied] = useState(false);

  if (home && !formInitialized) {
    setName(home.name || '');
    setDescription(home.description || '');
    setAddress(home.address || '');
    setFormInitialized(true);
  }

  if (loadingHome || loadingMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!home || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        No se pudo cargar la información del hogar
      </div>
    );
  }

  const isAdmin = home.myRole === 'ADMIN';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    updateHomeMutation.mutate(
      { name: name.trim(), description: description.trim() || undefined, address: address.trim() || undefined },
      {
        onSuccess: () => toast.success('Hogar actualizado'),
        onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Error al actualizar'),
      }
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(home.inviteCode);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = () => {
    if (!window.confirm('¿Regenerar código de invitación? El código actual dejará de funcionar.')) return;
    regenerateCodeMutation.mutate(undefined, {
      onSuccess: () => toast.success('Código regenerado'),
      onError: () => toast.error('Error al regenerar código'),
    });
  };

  const handleRoleChange = (memberId: string, role: string) => {
    updateRoleMutation.mutate(
      { memberId, role },
      {
        onSuccess: () => toast.success('Rol actualizado'),
        onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Error al cambiar rol'),
      }
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!window.confirm(`¿Expulsar a ${memberName}? Perderá acceso al hogar.`)) return;
    removeMemberMutation.mutate(memberId, {
      onSuccess: () => toast.success(`${memberName} expulsado`),
      onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Error al expulsar'),
    });
  };

  const handleLeave = () => {
    if (!window.confirm('¿Salir del hogar? Perderás acceso a todos los datos.')) return;
    leaveHomeMutation.mutate(homeId!, {
      onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Error al salir del hogar'),
    });
  };

  const handleDelete = () => {
    if (!window.confirm('¿ELIMINAR este hogar permanentemente? Todos los datos se perderán. Esta acción NO se puede deshacer.')) return;
    deleteHomeMutation.mutate(homeId!, {
      onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Error al eliminar'),
    });
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={`/homes/${homeId}`}>
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Configuración del Hogar</h1>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Sección 1: Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="home-name">Nombre *</Label>
                  <Input
                    id="home-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-description">Descripción</Label>
                  <Input
                    id="home-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-address">Dirección</Label>
                  <Input
                    id="home-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Dirección opcional"
                  />
                </div>
                {isAdmin && (
                  <Button type="submit" disabled={updateHomeMutation.isPending}>
                    {updateHomeMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Sección 2: Código de invitación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Código de invitación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Comparte este código para que otros se unan al hogar.
              </p>
              <div className="flex gap-2">
                <Input
                  value={home.inviteCode}
                  readOnly
                  className="font-mono text-lg tracking-wider"
                />
                <Button variant="outline" onClick={handleCopyCode}>
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateCode}
                  disabled={regenerateCodeMutation.isPending}
                >
                  {regenerateCodeMutation.isPending ? 'Regenerando...' : 'Regenerar código'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sección 3: Miembros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Miembros ({members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members?.map((member: any) => {
                  const isCurrentUser = member.userId === user.id;
                  const canModify = isAdmin && !isCurrentUser && member.role !== 'ADMIN';

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {member.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {member.name}
                            {isCurrentUser && (
                              <span className="text-muted-foreground font-normal"> (Tú)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && !isCurrentUser ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-xs h-8 px-2 rounded-md border border-input bg-background"
                            disabled={updateRoleMutation.isPending}
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="MEMBER">Miembro</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              member.role === 'ADMIN'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {member.role === 'ADMIN' ? 'Admin' : 'Miembro'}
                          </span>
                        )}

                        {canModify && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={removeMemberMutation.isPending}
                          >
                            Expulsar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sección 4: Zona de peligro */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zona de peligro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Salir del hogar</p>
                  <p className="text-xs text-muted-foreground">
                    Perderás acceso. Necesitarás un nuevo código para volver.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeave}
                  disabled={leaveHomeMutation.isPending}
                >
                  Salir
                </Button>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between pt-4 border-t border-destructive/20">
                  <div>
                    <p className="font-medium text-sm">Eliminar hogar</p>
                    <p className="text-xs text-muted-foreground">
                      Todos los datos se perderán permanentemente.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteHomeMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </main>
  );
}
