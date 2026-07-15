import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database';
import fs from 'fs/promises';
import path from 'path';
import { OrderModelMongoDB } from '../models/OrderModelMongo';
import { ProductModelMongoDB } from '../models/ProductModelMongo';

const migrate = async (): Promise<void> => {
  console.log('Starting migration to MongoDB...');
  
  await connectDB();
  console.log('Connected to MongoDB');

  try {
    // Migrate orders
    const ordersPath = path.join(__dirname, '../data/orders.json');
    const ordersData = await fs.readFile(ordersPath, 'utf-8');
    const orders = JSON.parse(ordersData);
    
    console.log(`Migrating ${orders.length} orders...`);
    
    // Clear existing orders
    const { OrderModelMongo } = await import('../models/orderSchema');
    await OrderModelMongo.deleteMany({});
    
    // Insert orders
    for (const order of orders) {
      await OrderModelMongo.create({
        ...order,
        _id: undefined // Let MongoDB generate _id, we use custom id field
      });
    }
    
    console.log(`✓ Migrated ${orders.length} orders`);

    // Migrate products
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsData);
    
    console.log(`Migrating ${products.length} products...`);
    
    // Clear existing products
    const { ProductModelMongo } = await import('../schemas/productSchema');
    await ProductModelMongo.deleteMany({});
    
    // Insert products
    for (const product of products) {
      await ProductModelMongo.create({
        ...product,
        _id: undefined
      });
    }
    
    console.log(`✓ Migrated ${products.length} products`);

    console.log('\n✓ Migration completed successfully!');
    console.log('\nYou can now verify the data in MongoDB Compass at localhost:27017');
    console.log('Database: order-dashboard');
    console.log('Collections: orders, products');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

migrate();