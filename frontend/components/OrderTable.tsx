'use client';

import { Order } from '../types/order';
import { MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
  onOrderClick: (order: Order) => void;
}

export default function OrderTable({ orders, onOrderClick }: OrderTableProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      default: return '';
    }
  };

  return (
    <div className="border rounded-xl bg-card overflow-hidden mx-8">
      <Table>
        <TableHeader>
          <TableRow>
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
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer h-14"
              onClick={() => onOrderClick(order)}
            >
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
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical size={16} className="text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}