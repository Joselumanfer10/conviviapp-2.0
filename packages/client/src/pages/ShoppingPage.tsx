import { Link, useParams } from 'react-router-dom';
import { ShoppingItemStatus } from '@conviviapp/shared';
import {
  useShoppingItems,
  useDeleteShoppingItem,
  useMarkAsBought,
  ShoppingItemCard,
  AddShoppingItemForm,
} from '@/features/shopping';
import { useSocketQueryInvalidation, useSocketToasts } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { PageTransition } from '@/components/ui/page-transition';

export function ShoppingPage() {
  const { homeId } = useParams<{ homeId: string }>();
  useSocketQueryInvalidation(homeId);
  useSocketToasts(homeId);

  const { data: items, isLoading } = useShoppingItems(homeId!);
  const deleteItemMutation = useDeleteShoppingItem(homeId!);
  const markAsBoughtMutation = useMarkAsBought(homeId!);

  const pendingItems = items?.filter(
    (item) => item.status === ShoppingItemStatus.PENDING
  );
  const boughtItems = items?.filter(
    (item) => item.status === ShoppingItemStatus.BOUGHT
  );

  const handleDelete = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const handleMarkAsBought = (itemId: string) => {
    markAsBoughtMutation.mutate({ itemId, data: {} });
  };

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
          <h1 className="text-xl font-bold">Lista de compras</h1>
        </div>
      </header>

      <PageTransition className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anadir item</CardTitle>
            </CardHeader>
            <CardContent>
              <AddShoppingItemForm homeId={homeId!} />
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {pendingItems && pendingItems.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">
                    Por comprar ({pendingItems.length})
                  </h2>
                  <AnimatedList>
                    {pendingItems.map((item) => (
                      <AnimatedListItem key={item.id} layoutId={item.id}>
                        <ShoppingItemCard
                          item={item}
                          onMarkAsBought={handleMarkAsBought}
                          onDelete={handleDelete}
                        />
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                </div>
              )}

              {boughtItems && boughtItems.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    Comprados ({boughtItems.length})
                  </h2>
                  <AnimatedList>
                    {boughtItems.map((item) => (
                      <AnimatedListItem key={item.id} layoutId={`bought-${item.id}`}>
                        <ShoppingItemCard item={item} />
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                </div>
              )}

              {(!items || items.length === 0) && (
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-muted-foreground">
                      La lista de compras esta vacia
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
