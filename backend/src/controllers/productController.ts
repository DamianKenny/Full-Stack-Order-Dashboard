import { Request, Response, NextFunction } from 'express';
import { ProductModelMongoDB } from '../models/ProductModelMongo';
import { OrderModelMongoDB } from '../models/OrderModelMongo';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.query;

    if (category && typeof category === 'string') {
      const products = await ProductModelMongoDB.findByCategory(category);
      res.json(products);
    } else {
      const products = await ProductModelMongoDB.findAll();
      res.json(products);
    }
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await OrderModelMongoDB.findAll();
    
    // Count item frequency across all orders
    const itemCounts: Record<string, number> = {};
    const itemRevenue: Record<string, number> = {};
    
    for (const order of orders) {
      for (const item of order.items) {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
        // Revenue per item is approximated by dividing total equally among items
        const itemShare = order.total / order.items.length;
        itemRevenue[item] = (itemRevenue[item] || 0) + itemShare;
      }
    }

    // Sort by frequency and take top 10
    const topProducts = Object.entries(itemCounts)
      .map(([name, count]) => ({
        name,
        count,
        revenue: Math.round(itemRevenue[name] * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};