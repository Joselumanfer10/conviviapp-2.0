import { useState } from 'react';
import type { CreateHouseRuleInput } from '@conviviapp/shared';
import { useCreateHouseRule } from '../hooks/useHouseRules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateRuleFormProps {
  homeId: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'convivencia', label: 'Convivencia' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'ruido', label: 'Ruido' },
  { value: 'visitas', label: 'Visitas' },
  { value: 'espacios', label: 'Espacios' },
  { value: 'gastos', label: 'Gastos' },
  { value: 'general', label: 'General' },
];

const PRIORITIES = [
  { value: 0, label: 'Normal', color: 'border-border' },
  { value: 1, label: 'Importante', color: 'border-yellow-500' },
  { value: 2, label: 'Critica', color: 'border-red-500' },
];

export function CreateRuleForm({ homeId, onSuccess }: CreateRuleFormProps) {
  const createMutation = useCreateHouseRule(homeId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState(0);

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('general');
    setPriority(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateHouseRuleInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        handleReset();
        onSuccess?.();
      },
    });
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nueva regla</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-title">Titulo</Label>
            <Input
              id="rule-title"
              placeholder="Ej: No hacer ruido despues de las 23:00"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-description">Descripcion</Label>
            <textarea
              id="rule-description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Describe la regla con detalle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 rounded-md border-2 px-2 py-1.5 text-xs font-medium transition-all ${
                      priority === p.value
                        ? `${p.color} bg-primary/10 text-primary`
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando...
              </span>
            ) : (
              'Crear regla'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
