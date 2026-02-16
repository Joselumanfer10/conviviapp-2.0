import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className merge)', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('maneja valores condicionales', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('resuelve conflictos de Tailwind (ultima clase gana)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('resuelve conflictos de colores de Tailwind', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('maneja arrays de clases', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('ignora valores falsy (null, undefined, false)', () => {
    expect(cn('base', null, undefined, false, 'end')).toBe('base end');
  });

  it('retorna string vacio sin argumentos', () => {
    expect(cn()).toBe('');
  });
});
