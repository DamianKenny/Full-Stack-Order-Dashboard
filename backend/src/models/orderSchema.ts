import mongoose, { Schema } from 'mongoose';

export interface OrderDocument extends mongoose.Document {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  createdAt: string;
}

const orderSchema = new Schema<OrderDocument>({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  items: [{ type: String, required: true }],
  total: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending'
  },
  createdAt: { type: String, required: true }
}, {
  versionKey: false,
  timestamps: false
});

// Index for faster queries
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const OrderModelMongo = mongoose.model<OrderDocument>('Order', orderSchema);
