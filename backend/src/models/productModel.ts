import fs from 'fs/promises';
import path from 'path';
import { Product } from '../types/product';

const DATA_FILE = path.join(__dirname, '../data/products.json');

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }

  static async findByCategory(category: string): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }
}