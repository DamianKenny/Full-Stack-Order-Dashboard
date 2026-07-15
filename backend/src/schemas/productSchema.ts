import mongoose, { Schema } from 'mongoose';
import { Product } from '../types/product';

export interface ProductDocument extends mongoose.Document {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
}

const productSchema = new Schema<ProductDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: false, min: 0 }
}, {
  versionKey: false,
  timestamps: false
});

productSchema.index({ category: 1 });

export const ProductModelMongo = mongoose.model<ProductDocument>('Product', productSchema);
