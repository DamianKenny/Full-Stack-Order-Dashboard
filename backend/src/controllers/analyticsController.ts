import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { parseISO, startOfDay, endOfDay, format, isWithinInterval } from 'date-fns';

export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const orders = await OrderModel.findAll();

    const start = typeof startDate === 'string' && startDate ? startOfDay(parseISO(startDate)) : startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = typeof endDate === 'string' && endDate ? endOfDay(parseISO(endDate)) : endOfDay(new Date());

    const filteredOrders = orders.filter((order) => {
      if (!order.createdAt) return false;
      const created = parseISO(order.createdAt);
      return isWithinInterval(created, { start, end });
    });

    const aggregated = filteredOrders.reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const created = parseISO(order.createdAt);
      const bucket = groupBy === 'month'
        ? format(created, 'yyyy-MM')
        : format(created, 'yyyy-MM-dd');

      acc[bucket] = (acc[bucket] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(aggregated)
      .map(([period, revenue]) => ({ period, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getVolumeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupBy = 'day' } = req.query;
    const orders = await OrderModel.findAll();

    const counts = orders.reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const created = parseISO(order.createdAt);
      const bucket = groupBy === 'hour'
        ? format(created, 'yyyy-MM-dd HH:00')
        : format(created, 'yyyy-MM-dd');

      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(counts)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCustomerSegmentAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await OrderModel.findAll();

    const segments = orders.reduce((acc, order) => {
      const status = order.status;
      if (!acc[status]) {
        acc[status] = { status, count: 0, revenue: 0 };
      }
      acc[status].count += 1;
      acc[status].revenue += order.total;
      return acc;
    }, {} as Record<string, { status: string; count: number; revenue: number }>);

    const result = Object.values(segments).map((segment) => ({
      ...segment,
      revenue: Math.round(segment.revenue * 100) / 100,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};
