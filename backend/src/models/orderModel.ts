import fs from 'fs/promises';
import path from 'path';
import { Order, CreateOrderDTO } from '../types/order';

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
  static async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const orders = await this.findAll();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = status as any;
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
    
    return orders[orderIndex];
  }
}