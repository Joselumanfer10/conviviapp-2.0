import { ShoppingItemStatus, type ShoppingItem } from '@conviviapp/shared';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onMarkAsBought?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
}

export function ShoppingItemCard({
  item,
  onMarkAsBought,
  onDelete,
}: ShoppingItemCardProps) {
  const isBought = item.status === ShoppingItemStatus.BOUGHT;

  return (
    <div
      className={`flex items-center justify-between p-4 bg-card rounded-lg border ${
        isBought ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => !isBought && onMarkAsBought?.(item.id)}
          disabled={isBought}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isBought
              ? 'bg-primary border-primary'
              : 'border-muted-foreground hover:border-primary'
          }`}
        >
          {isBought && (
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
        <div>
          <p className={`font-medium ${isBought ? 'line-through' : ''}`}>
            {item.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.quantity} {item.unit || 'unidad(es)'}
            {item.category && ` - ${item.category}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isBought && item.price && (
          <span className="text-sm font-medium">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
            }).format(item.price)}
          </span>
        )}
        {onDelete && !isBought && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
