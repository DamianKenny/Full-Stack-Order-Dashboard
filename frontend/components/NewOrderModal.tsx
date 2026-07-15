'use client';

import { useState, useEffect } from 'react';
import { useOrderMutation } from '../hooks/useOrderMutation';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LineItem {
  product: Product;
  quantity: number;
}

export default function NewOrderModal({ isOpen, onClose, onSuccess }: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [clientError, setClientError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { createOrder, isSubmitting, error: serverError } = useOrderMutation();
  const { products, isLoading: productsLoading } = useProducts();

  useEffect(() => {
    if (!isOpen) {
      setCustomerName('');
      setLineItems([]);
      setSearchTerm('');
      setClientError('');
    }
  }, [isOpen]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const addProduct = (product: Product) => {
    setLineItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setLineItems((prev) => {
      return prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (productId: string) => {
    setLineItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (!customerName.trim()) {
      setClientError('Customer name is required');
      return;
    }

    if (lineItems.length === 0) {
      setClientError('Add at least one product');
      return;
    }

    if (totalAmount <= 0) {
      setClientError('Total must be a positive number');
      return;
    }

    const items = lineItems.map(
      (item) => `${item.product.name} x${item.quantity}`
    );

    try {
      await createOrder({
        customerName: customerName.trim(),
        items,
        total: Math.round(totalAmount * 100) / 100,
      });

      onSuccess();
      onClose();
    } catch (err) {
      // Error handled in hook
    }
  };

  const error = clientError || serverError;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Select products and quantities to build the order. Total is calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm bg-destructive-foreground text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Left panel: Product catalog */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Customer Name *
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Products
                </label>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  disabled={isSubmitting || productsLoading}
                  className="mb-2"
                />
              </div>

              <div className="h-64 rounded-lg border border-border overflow-y-auto">
                <div className="p-1">
                  {categories.map((category) => {
                    const categoryProducts = filteredProducts.filter(
                      (p) => p.category === category
                    );
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category} className="mb-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-2 py-1.5">
                          {category}
                        </p>
                        {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => addProduct(product)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              addProduct(product);
                            }
                          }}
                          aria-disabled={isSubmitting}
                          className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <span className="text-muted-foreground text-xs font-medium">
                            ADD
                          </span>
                        </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right panel: Order summary */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                Order Summary
              </label>
              <div className="rounded-lg border border-border flex-1 overflow-hidden">
                <div className="h-48 overflow-y-auto">
                  <div className="p-2">
                    {lineItems.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No products added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lineItems.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-2 rounded-md border border-border p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${item.product.price.toFixed(2)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => updateQuantity(item.product.id, -1)}
                                disabled={isSubmitting}
                              >
                                -
                              </Button>
                              <span className="text-sm text-foreground w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => updateQuantity(item.product.id, 1)}
                                disabled={isSubmitting}
                              >
                                +
                              </Button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id)}
                              disabled={isSubmitting}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-border px-3 py-3 flex items-center justify-between bg-muted/30">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-lg font-mono font-bold text-foreground">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting || lineItems.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}