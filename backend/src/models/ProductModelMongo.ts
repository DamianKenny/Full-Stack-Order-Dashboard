import { Product } from '../types/product';
import { ProductModelMongo } from '../schemas/productSchema';

export class ProductModelMongoDB {
  static async findAll(): Promise<Product[]> {
    const products = await ProductModelMongo.find({});
    return products.map(product => ({
      id: (product as any).id,
      name: (product as any).name,
      price: (product as any).price,
      category: (product as any).category
    }));
  }

  static async findByCategory(category: string): Promise<Product[]> {
    const products = await ProductModelMongo.find({ 
      category: { $regex: category, $options: 'i' } 
    });
    return products.map(product => ({
      id: (product as any).id,
      name: (product as any).name,
      price: (product as any).price,
      category: (product as any).category
    }));
  }
}
