'use client';

import { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderTableProps {
  orders: Order[];
  selectedIds: string[];
  onOrderClick: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export default function OrderTable({
  orders,
  selectedIds,
  onOrderClick,
  onDelete,
  onEdit,
  onToggleSelect,
  onSelectAll,
}: OrderTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      default: return '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu-id]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allOrderIds = orders.map((order) => order.id);
  const areAllSelected = allOrderIds.length > 0 && allOrderIds.every((id) => selectedIds.includes(id));

  return (
    <>
      <div className="border rounded-xl bg-card overflow-hidden mx-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">
                <input
                  type="checkbox"
                  checked={areAllSelected}
                  onChange={() => onSelectAll(areAllSelected ? [] : allOrderIds)}
                />
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">Order ID</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">Customer</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">Items</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5 text-right">Total</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">Status</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-11 px-5">Placed</TableHead>
              <TableHead className="h-11 px-5 w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <TableRow
                  key={order.id}
                  className={`h-14 ${isSelected ? 'bg-muted/50' : ''}`}
                  onClick={() => onOrderClick(order)}
                >
                  <TableCell className="px-5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => {
                        event.stopPropagation();
                        onToggleSelect(order.id);
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground px-5">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground truncate px-5">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px] px-5">
                    {order.items.join(', ')}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground text-right px-5">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5">
                    <Badge
                      className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium border-0 ${getStatusClass(order.status)}`}
                      variant="default"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-sm text-muted-foreground px-5"
                    title={order.createdAt}
                  >
                    {order.createdAt
                      ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="px-2">
                    <div className="relative" data-menu-id={order.id}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === order.id ? null : order.id);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-7 z-50 w-40 rounded-md border bg-white py-1 shadow-lg">
                          <button
                            className="flex w-full items-center px-3 py-2 text-sm hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onOrderClick(order);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <div className="my-1 h-px bg-slate-200" />
                          <button
                            className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              setDeleteConfirmOrder(order);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!deleteConfirmOrder} onOpenChange={(open) => !open && setDeleteConfirmOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order <span className="font-mono font-semibold">{deleteConfirmOrder?.id}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOrder(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteConfirmOrder && onDelete) {
                  try {
                    await onDelete(deleteConfirmOrder);
                    setDeleteConfirmOrder(null);
                  } catch (err) {
                    console.error('Delete failed:', err);
                  }
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

