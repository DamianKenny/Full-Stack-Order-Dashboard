import test from 'node:test';
import assert from 'node:assert/strict';
import { applyOrderFilters } from './orderFilters';
import type { Order } from '../types/order';

const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Acme Corp',
    items: ['Keyboard', 'Monitor'],
    total: 1200,
    status: 'Delivered',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'ORD-002',
    customerName: 'Northwind',
    items: ['Mouse'],
    total: 90,
    status: 'Pending',
    createdAt: '2025-02-15T10:00:00.000Z',
  },
  {
    id: 'ORD-003',
    customerName: 'Contoso',
    items: ['Chair'],
    total: 250,
    status: 'Shipped',
    createdAt: '2025-03-20T10:00:00.000Z',
  },
];

test('filters by search text across customer name, id, and items', () => {
  const result = applyOrderFilters(sampleOrders, { search: 'mouse' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'ORD-002');
});

test('filters by date range and sorts by total descending', () => {
  const result = applyOrderFilters(sampleOrders, {
    dateFrom: '2025-02-01',
    dateTo: '2025-03-31',
    sortBy: 'total',
    sortOrder: 'desc',
  });

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((order) => order.id), ['ORD-003', 'ORD-002']);
});

test('filters by status and sorts by date ascending', () => {
  const result = applyOrderFilters(sampleOrders, {
    status: 'Pending',
    sortBy: 'date',
    sortOrder: 'asc',
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'ORD-002');
});
