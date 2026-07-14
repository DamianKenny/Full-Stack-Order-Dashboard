import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { validateCreateOrder, ValidationError } from '../utils/validators';

export const getOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { status } = req.query;

        if (status && typeof status === 'string' && status !== 'All') {
            const orders = await OrderModel.findByStatus(status);
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
        //validate request body
        validateCreateOrder(req.body);

        //create order
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
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        const updatedOrder = await OrderModel.updateStatus(id, status);

        if (!updatedOrder) {
            res.status(404).json({ error: 'Order not found '});
            return;
        }

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};