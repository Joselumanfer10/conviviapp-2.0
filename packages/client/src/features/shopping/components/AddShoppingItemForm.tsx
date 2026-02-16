import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateShoppingItem } from '../hooks/useShopping';

interface AddShoppingItemFormProps {
  homeId: string;
}

export function AddShoppingItemForm({ homeId }: AddShoppingItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const createItemMutation = useCreateShoppingItem(homeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createItemMutation.mutate(
      {
        name: name.trim(),
        quantity: parseInt(quantity) || 1,
      },
      {
        onSuccess: () => {
          setName('');
          setQuantity('1');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Anadir item..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={createItemMutation.isPending}
        className="flex-1"
      />
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        disabled={createItemMutation.isPending}
        className="w-20"
      />
      <Button type="submit" disabled={createItemMutation.isPending || !name.trim()}>
        {createItemMutation.isPending ? '...' : 'Anadir'}
      </Button>
    </form>
  );
}
