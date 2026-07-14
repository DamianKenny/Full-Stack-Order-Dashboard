import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { validateCreateOrder, ValidationError } from '../utils/validators';

// Type definitions for route parameters
interface UpdateOrderParams {
  id: string;
}

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status;

    // Type guard and validation
    if (status && typeof status === 'string' && status !== 'All') {
      const orders = await OrderModel.findByStatus(status);
      res.json(orders);
    } else {
      const orders = await OrderModel.findAll();
      res.json(orders);
    }
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateCreateOrder(req.body);
    const newOrder = await OrderModel.create(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ 
        error: error.message,
        field: 'validation' 
      });
      return;
    }
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request<UpdateOrderParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    // Validate status
    if (typeof status !== 'string') {
      res.status(400).json({ error: 'Status must be a string' });
      return;
    }

    const updatedOrder = await OrderModel.updateStatus(id, status);

    if (!updatedOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};