import { CreateOrderDTO } from '../types/order';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateCreateOrder = (data: any): void => {
  // Check if customerName exists and is not empty
  if (!data.customerName || data.customerName.trim() === '') {
    throw new ValidationError('Customer name is required and cannot be empty');
  }

  // Check if total is a valid positive number
  if (typeof data.total !== 'number' || data.total <= 0) {
    throw new ValidationError('Total must be a positive number greater than 0');
  }

  // ENHANCEMENT: Validate items array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new ValidationError('Items array must contain at least one item');
  }

  // ENHANCEMENT: Validate status if provided
  const validStatuses = ['Pending', 'Shipped', 'Delivered'];
  if (data.status && !validStatuses.includes(data.status)) {
    throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
};