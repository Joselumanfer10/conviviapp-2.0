import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useJoinHome } from '../hooks/useHomes';
import type { AxiosError } from 'axios';

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function JoinHomeForm() {
  const [inviteCode, setInviteCode] = useState('');

  const joinHomeMutation = useJoinHome();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinHomeMutation.mutate({ inviteCode: inviteCode.trim() });
  };

  const error = joinHomeMutation.error as AxiosError<ApiError> | null;
  const errorMessage = error?.response?.data?.error?.message || error?.message;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Unirse a un hogar</CardTitle>
        <CardDescription>
          Introduce el codigo de invitacion que te han compartido
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Codigo de invitacion</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Ej: abc123xyz"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              disabled={joinHomeMutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={joinHomeMutation.isPending || !inviteCode.trim()}
          >
            {joinHomeMutation.isPending ? 'Uniendose...' : 'Unirse al hogar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
