'use client';

import { Order } from '../types/order';
import { MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderTableProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

const statusStyles = {
  Pending: { text: 'var(--pending-text)', bg: 'var(--pending-fill)' },
  Shipped: { text: 'var(--shipped-text)', bg: 'var(--shipped-fill)' },
  Delivered: { text: 'var(--delivered-text)', bg: 'var(--delivered-fill)' },
};

export default function OrderTable({ orders, onOrderClick }: OrderTableProps) {
  return (
    <div className="border border-default rounded-xl bg-surface overflow-hidden mx-8">
      {/* Header */}
      <div className="grid grid-cols-[140px_1fr_2fr_120px_130px_140px_40px] gap-4 h-11 px-5 border-b border-default items-center">
        <div className="text-xs font-medium uppercase tracking-wide text-faint">Order ID</div>
        <div className="text-xs font-medium uppercase tracking-wide text-faint">Customer</div>
        <div className="text-xs font-medium uppercase tracking-wide text-faint">Items</div>
        <div className="text-xs font-medium uppercase tracking-wide text-faint text-right">
          Total
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-faint">Status</div>
        <div className="text-xs font-medium uppercase tracking-wide text-faint">Placed</div>
        <div></div>
      </div>

      {/* Rows */}
      {orders.map((order, index) => (
        <div
          key={order.id}
          onClick={() => onOrderClick(order)}
          className={`grid grid-cols-[140px_1fr_2fr_120px_130px_140px_40px] gap-4 h-14 px-5 items-center cursor-pointer hover:bg-[color:var(--border-subtle)] transition-colors duration-100 ${
            index !== orders.length - 1 ? 'border-b border-subtle' : ''
          }`}
        >
          {/* Order ID */}
          <div className="font-mono text-sm text-primary">{order.id}</div>

          {/* Customer */}
          <div className="text-sm font-medium text-primary truncate">
            {order.customerName}
          </div>

          {/* Items */}
          <div className="text-sm text-secondary truncate">
            {order.items.join(', ')}
          </div>

          {/* Total */}
          <div className="font-mono text-sm text-primary text-right">
            ${order.total.toFixed(2)}
          </div>

          {/* Status Badge */}
          <div>
            <span
              className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: statusStyles[order.status].bg,
                color: statusStyles[order.status].text,
              }}
            >
              {order.status}
            </span>
          </div>

          {/* Placed */}
          <div className="text-sm text-secondary" title={order.createdAt}>
            {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'N/A'}
          </div>

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle kebab menu
            }}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[color:var(--border-subtle)] transition-colors"
          >
            <MoreVertical size={16} className="text-secondary" />
          </button>
        </div>
      ))}
    </div>
  );
}