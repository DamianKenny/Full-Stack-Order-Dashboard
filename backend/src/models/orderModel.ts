import fs from 'fs/promises';
import path from 'path';
import { Order, CreateOrderDTO, OrderStatus } from '../types/order';

const DATA_FILE = path.join(__dirname, '../data/orders.json');

export class OrderModel {
  // Ensure data file exists
  private static async ensureDataFile(): Promise<void> {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  // Read all orders
  static async findAll(): Promise<Order[]> {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }

  // Filter by status
  static async findByStatus(status: string): Promise<Order[]> {
    const orders = await this.findAll();
    return orders.filter(order => 
      order.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Create new order
  static async create(orderData: CreateOrderDTO): Promise<Order> {
    const orders = await this.findAll();
    
    // Generate ID
    const newId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    
    const newOrder: Order = {
      id: newId,
      customerName: orderData.customerName,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || 'Pending',
      createdAt: new Date().toISOString(), // ENHANCEMENT
    };

    orders.push(newOrder);
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
    
    return newOrder;
  }

  // ENHANCEMENT: Update order status
  static async updateStatus(
    id: string, 
    status: string
): Promise<Order | null> {

    const validStatuses: Array<Order['status']> = ['Pending', 'Shipped', 'Delivered'];
    
    if (!validStatuses.includes(status as Order['status'])) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const orders = await this.findAll();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = status as any;
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
    
    return orders[orderIndex];
  }

  // Delete order by ID
  static async delete(id: string): Promise<boolean> {
    const orders = await this.findAll();
    const initialLength = orders.length;
    const filteredOrders = orders.filter(o => o.id !== id);
    
    if (filteredOrders.length === initialLength) {
      return false; // Order not found
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredOrders, null, 2));
    return true;
  }

  static async updateStatusBulk(ids: string[], status: string): Promise<Order[]> {
    const validStatuses: Array<Order['status']> = ['Pending', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status as Order['status'])) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const orders = await this.findAll();
    const updatedOrders: Order[] = [];

    const nextOrders = orders.map((order) => {
      if (ids.includes(order.id)) {
        const updatedOrder = { ...order, status: status as Order['status'] };
        updatedOrders.push(updatedOrder);
        return updatedOrder;
      }
      return order;
    });

    await fs.writeFile(DATA_FILE, JSON.stringify(nextOrders, null, 2));
    return updatedOrders;
  }

  static async deleteBulk(ids: string[]): Promise<number> {
    const orders = await this.findAll();
    const filteredOrders = orders.filter((order) => !ids.includes(order.id));
    const deletedCount = orders.length - filteredOrders.length;

    await fs.writeFile(DATA_FILE, JSON.stringify(filteredOrders, null, 2));
    return deletedCount;
  }
}

