'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useOrderMutation } from '../hooks/useOrderMutation';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewOrderModal({ isOpen, onClose, onSuccess }: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState('');
  const [total, setTotal] = useState('');
  const [clientError, setClientError] = useState('');

  const { createOrder, isSubmitting, error: serverError } = useOrderMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (!customerName.trim()) {
      setClientError('Customer name is required');
      return;
    }

    if (!items.trim()) {
      setClientError('At least one item is required');
      return;
    }

    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      setClientError('Total must be a positive number');
      return;
    }

    try {
      await createOrder({
        customerName: customerName.trim(),
        items: items.split(',').map((item) => item.trim()),
        total: totalNum,
      });

      setCustomerName('');
      setItems('');
      setTotal('');
      onSuccess();
      onClose();
    } catch (err) {
      // Error handled in hook
    }
  };

  if (!isOpen) return null;

  const error = clientError || serverError;

  return (
    <>
      {/* Scrim */}
      <div className="fixed inset-0 bg-black/6 animate-fade-in z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-default rounded-xl shadow-elevated animate-fade-in z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-default">
          <h2 className="text-lg font-semibold text-primary">Create New Order</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[color:var(--border-subtle)] transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--error-fill)', color: 'var(--error-text)' }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-default bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
              placeholder="John Doe"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Items (comma-separated) *
            </label>
            <input
              type="text"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-default bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
              placeholder="Bread x2, Milk x1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Total Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-default bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
              placeholder="25.00"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 px-4 rounded-lg border border-default text-sm font-medium text-secondary hover:bg-[color:var(--border-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-9 px-4 bg-[color:var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}