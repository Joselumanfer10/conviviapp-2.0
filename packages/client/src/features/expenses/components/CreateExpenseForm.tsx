import { useState } from 'react';
import { SplitMode } from '@conviviapp/shared';
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
import { useCreateExpense } from '../hooks/useExpenses';
import type { AxiosError } from 'axios';

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface CreateExpenseFormProps {
  homeId: string;
  onSuccess?: () => void;
}

export function CreateExpenseForm({ homeId, onSuccess }: CreateExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const createExpenseMutation = useCreateExpense(homeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpenseMutation.mutate(
      {
        amount: parseFloat(amount),
        description,
        splitMode: SplitMode.EQUAL,
        isRecurring: false,
      },
      {
        onSuccess: () => {
          setAmount('');
          setDescription('');
          onSuccess?.();
        },
      }
    );
  };

  const error = createExpenseMutation.error as AxiosError<ApiError> | null;
  const errorMessage = error?.response?.data?.error?.message || error?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nuevo gasto</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (EUR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={createExpenseMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              type="text"
              placeholder="Ej: Supermercado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={createExpenseMutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? 'Guardando...' : 'Guardar gasto'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
