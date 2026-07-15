import { Order, CreateOrderDTO, OrderStatus } from '../types/order';
import { OrderModelMongo } from './orderSchema';

export class OrderModelMongoDB {
  static async findAll(): Promise<Order[]> {
    const orders = await OrderModelMongo.find({}).sort({ createdAt: -1 });
    return orders.map((order: any) => ({
      id: order.id,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }));
  }

  static async findByStatus(status: string): Promise<Order[]> {
    const orders = await OrderModelMongo.find({ 
      status: { $regex: status, $options: 'i' } 
    }).sort({ createdAt: -1 });
    return orders.map((order: any) => ({
      id: order.id,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }));
  }

  static async create(orderData: CreateOrderDTO): Promise<Order> {
    const count = await OrderModelMongo.countDocuments();
    const newId = `ORD-${String(count + 1).padStart(3, '0')}`;
    
    const newOrder = new OrderModelMongo({
      id: newId,
      customerName: orderData.customerName,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || 'Pending',
      createdAt: new Date().toISOString()
    });
    
    await newOrder.save();
    
    return {
      id: newOrder.id,
      customerName: newOrder.customerName,
      items: newOrder.items,
      total: newOrder.total,
      status: newOrder.status,
      createdAt: newOrder.createdAt
    };
  }

  static async updateStatus(id: string, status: string): Promise<Order | null> {
    const validStatuses: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];
    
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const order = await OrderModelMongo.findOneAndUpdate(
      { id },
      { status },
      { new: true }
    );
    
    if (!order) return null;
    
    return {
      id: order.id,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  static async delete(id: string): Promise<boolean> {
    const result = await OrderModelMongo.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async update(id: string, updates: { customerName?: string; items?: string[]; total?: number }): Promise<Order | null> {
    const order = await OrderModelMongo.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!order) return null;

    return {
      id: order.id,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  static async updateStatusBulk(ids: string[], status: string): Promise<Order[]> {
    const validStatuses: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];
    
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const orders = await OrderModelMongo.find({ id: { $in: ids } }) as any[];
    
    await OrderModelMongo.updateMany(
      { id: { $in: ids } },
      { status }
    );
    
    return orders.map((order: any) => ({
      id: order.id,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      status: status as 'Pending' | 'Shipped' | 'Delivered',
      createdAt: order.createdAt
    }));
  }

  static async deleteBulk(ids: string[]): Promise<number> {
    const result = await OrderModelMongo.deleteMany({ id: { $in: ids } });
    return result.deletedCount;
  }
}
