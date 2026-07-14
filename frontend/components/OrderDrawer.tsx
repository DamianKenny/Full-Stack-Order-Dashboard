'use client';

import { useEffect } from 'react';
import { Order } from '../types/order';
import { X, Check } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
}

const statusSteps = ['Placed', 'Pending', 'Shipped', 'Delivered'];

export default function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [order]);

  if (!order) return null;

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/6 animate-fade-in z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[420px] bg-surface border-l border-default shadow-elevated animate-slide-in-right z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-default">
          <h2 className="font-mono text-base font-semibold text-primary">{order.id}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[color:var(--border-subtle)] transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Status Timeline */}
        <div className="flex flex-col px-6 py-6 gap-4">
          {statusSteps.map((step, index) => {
            const isComplete = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step} className="flex gap-3">
                {/* Dot and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isComplete
                        ? 'bg-[color:var(--accent)]'
                        : 'border-2 border-default bg-surface'
                    }`}
                  />
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-px flex-1 my-1 ${
                        isComplete ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--border)]'
                      }`}
                      style={{ minHeight: '24px' }}
                    />
                  )}
                </div>

                {/* Label and Timestamp */}
                <div className="flex-1 pb-6">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
                    {step}
                  </p>
                  {isComplete && order.createdAt && (
                    <p className="text-xs text-secondary mt-1">
                      {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer & Items */}
        <div className="px-6 py-5 border-t border-default space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Customer</span>
            <span className="font-medium text-primary">{order.customerName}</span>
          </div>

          <div>
            <p className="text-sm text-secondary mb-2">Items</p>
            <ul className="space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="text-sm text-primary flex items-start">
                  <span className="mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total */}
        <div className="px-6 py-5 border-t border-default">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">Total Amount</span>
            <span className="text-lg font-mono font-semibold text-primary">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Actions */}
        <div className="border-t border-default px-6 py-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 px-4 rounded-lg border border-default text-sm font-medium text-secondary hover:bg-[color:var(--border-subtle)] transition-colors"
          >
            Close
          </button>
          {order.status !== 'Delivered' && (
            <button className="flex-1 h-9 px-4 bg-[color:var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Mark {order.status === 'Pending' ? 'Shipped' : 'Delivered'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}