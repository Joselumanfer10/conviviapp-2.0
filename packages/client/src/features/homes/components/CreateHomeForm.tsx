import { useState } from 'react';
import { SplitMode } from '@conviviapp/shared';
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
import { useCreateHome } from '../hooks/useHomes';
import type { AxiosError } from 'axios';

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function CreateHomeForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const createHomeMutation = useCreateHome();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHomeMutation.mutate({
      name,
      description: description || undefined,
      address: address || undefined,
      currency: 'EUR',
      defaultSplitMode: SplitMode.EQUAL,
    });
  };

  const error = createHomeMutation.error as AxiosError<ApiError> | null;
  const errorMessage = error?.response?.data?.error?.message || error?.message;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear nuevo hogar</CardTitle>
        <CardDescription>
          Crea un hogar y comparte el codigo con tus companeros
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
            <Label htmlFor="name">Nombre del hogar *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Piso Calle Mayor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={createHomeMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              type="text"
              placeholder="Descripcion opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createHomeMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              type="text"
              placeholder="Direccion opcional"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={createHomeMutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={createHomeMutation.isPending}
          >
            {createHomeMutation.isPending ? 'Creando...' : 'Crear hogar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
