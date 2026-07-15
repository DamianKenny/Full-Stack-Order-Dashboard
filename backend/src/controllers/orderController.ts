import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { validateCreateOrder, ValidationError } from '../utils/validators';
import { applyOrderFilters } from '../utils/orderFilters';
import { writeFileSync } from 'fs';
import path from 'path';
import { broadcastOrderEvent } from '../utils/liveEvents';

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
    const search = req.query.search;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;

    const orders = await OrderModel.findAll();
    const filteredOrders = applyOrderFilters(orders, {
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
      dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
      dateTo: typeof dateTo === 'string' ? dateTo : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy as 'date' | 'total' | 'status' : 'date',
      sortOrder: typeof sortOrder === 'string' ? sortOrder as 'asc' | 'desc' : 'desc',
    });

    res.json(filteredOrders);
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
    broadcastOrderEvent('order:created', { order: newOrder });
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

    broadcastOrderEvent('order:deleted', { id });
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

    broadcastOrderEvent('order:updated', { order: orders[orderIndex] });
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

    broadcastOrderEvent('order:updated', { order: updatedOrder });
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ids = req.body.ids;
    const status = req.body.status;

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      res.status(400).json({ error: 'ids must be an array of strings' });
      return;
    }

    if (typeof status !== 'string') {
      res.status(400).json({ error: 'status must be a string' });
      return;
    }

    const updatedOrders = await OrderModel.updateStatusBulk(ids, status);

    updatedOrders.forEach((order) => {
      broadcastOrderEvent('order:updated', { order });
    });

    res.json({ updatedCount: updatedOrders.length, orders: updatedOrders });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const bulkDeleteOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      res.status(400).json({ error: 'ids must be an array of strings' });
      return;
    }

    const deletedCount = await OrderModel.deleteBulk(ids);

    ids.forEach((id) => {
      broadcastOrderEvent('order:deleted', { id });
    });

    res.json({ deletedCount });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};