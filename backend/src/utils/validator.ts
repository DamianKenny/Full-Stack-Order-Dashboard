import { CreateOrderDTO } from '../types/order';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateCreateOrder = (data: any): void => {
    // to check if customer name is not empty and exists
    if (!data.customerName || data.customerName.trim() === '') {
        throw new ValidationError('Customer name is required and cannot be emoty');
    }

    // check if the total is a valid postiive number
    if (typeof data.total !== 'number' || data.total <= 0) {
        throw new ValidationError('Total must be a positive number greater than 0');
    }

    //Validsation items array
    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new ValidationError('Item array must contain atleast one item');
    }

    //validation status if approved
    const validStatus = ['Pending', 'Shipped', 'Delivered'];
    if (data.status && !validStatus.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }
}