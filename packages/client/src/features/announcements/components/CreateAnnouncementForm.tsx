import { useState } from 'react';
import { AnnouncementType } from '@conviviapp/shared';
import type { CreateAnnouncementInput } from '@conviviapp/shared';
import { useCreateAnnouncement } from '../hooks/useAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateAnnouncementFormProps {
  homeId: string;
  onSuccess?: () => void;
}

const typeOptions: { value: AnnouncementType; label: string; icon: string }[] = [
  { value: AnnouncementType.INFO, label: 'Anuncio', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: AnnouncementType.POLL, label: 'Encuesta', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { value: AnnouncementType.VOTE, label: 'Votacion', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
];

export function CreateAnnouncementForm({ homeId, onSuccess }: CreateAnnouncementFormProps) {
  const createMutation = useCreateAnnouncement(homeId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>(AnnouncementType.INFO);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [quorum, setQuorum] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const hasPollOptions = type === AnnouncementType.POLL || type === AnnouncementType.VOTE;

  const handleAddOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setType(AnnouncementType.INFO);
    setOptions(['', '']);
    setQuorum('');
    setExpiresAt('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateAnnouncementInput = {
      title: title.trim(),
      content: content.trim(),
      type,
      isPinned: false,
      options: hasPollOptions ? options.filter((o) => o.trim() !== '') : [],
      quorum: quorum ? parseInt(quorum, 10) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        handleReset();
        onSuccess?.();
      },
    });
  };

  const isValid =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    (!hasPollOptions || options.filter((o) => o.trim()).length >= 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nuevo anuncio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de tipo */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    type === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={opt.icon}
                    />
                  </svg>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Titulo */}
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Titulo</Label>
            <Input
              id="announcement-title"
              placeholder="Titulo del anuncio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="announcement-content">Contenido</Label>
            <textarea
              id="announcement-content"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Escribe el contenido del anuncio..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
            />
          </div>

          {/* Opciones de encuesta/votacion */}
          {hasPollOptions && (
            <div className="space-y-3">
              <Label>Opciones</Label>
              <div className="space-y-2">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                      {idx + 1}
                    </div>
                    <Input
                      placeholder={`Opcion ${idx + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Anadir opcion
                </Button>
              )}

              {/* Quorum */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quorum">Quorum (opcional)</Label>
                  <Input
                    id="quorum"
                    type="number"
                    placeholder="Ej: 3"
                    min={1}
                    value={quorum}
                    onChange={(e) => setQuorum(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Fecha limite (opcional)</Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
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
                Publicando...
              </span>
            ) : (
              'Publicar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
