import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { validateCreateOrder, ValidationError } from '../utils/validators';
import { writeFileSync } from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../data/orders.json');

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

export const deleteOrder = async (
  req: Request<UpdateOrderParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const deleted = await OrderModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const updateOrder = async (
  req: Request<UpdateOrderParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const { customerName, items, total } = req.body;

    const orders = await OrderModel.findAll();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (customerName !== undefined) orders[orderIndex].customerName = customerName;
    if (items !== undefined) orders[orderIndex].items = items;
    if (total !== undefined) orders[orderIndex].total = total;

    await new Promise<void>((resolve, reject) => {
      writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
      resolve();
    });

    res.json(orders[orderIndex]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
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