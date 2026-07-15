'use client';

import { useState, useEffect } from 'react';
import { useOrderMutation } from '../hooks/useOrderMutation';
import { Order } from '../types/order';
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

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

export default function EditOrderModal({ isOpen, onClose, order, onSuccess }: EditOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [clientError, setClientError] = useState('');

  const { updateOrder, isSubmitting, error: serverError } = useOrderMutation();

  useEffect(() => {
    if (isOpen && order) {
      setCustomerName(order.customerName);
      setItemsText(order.items.join(', '));
      setClientError('');
    }
  }, [isOpen, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (!customerName.trim()) {
      setClientError('Customer name is required');
      return;
    }

    if (!itemsText.trim()) {
      setClientError('At least one item is required');
      return;
    }

    const items = itemsText.split(',').map(item => item.trim()).filter(item => item !== '');

    if (items.length === 0) {
      setClientError('At least one item is required');
      return;
    }

    try {
      await updateOrder(order!.id, {
        customerName: customerName.trim(),
        items,
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
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update order details for <span className="font-mono font-semibold">{order?.id}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm bg-destructive-foreground text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
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
                Order Items *
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter items separated by commas (e.g., "Product A, Product B")
              </p>
              <textarea
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder="Product A, Product B, Product C"
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}