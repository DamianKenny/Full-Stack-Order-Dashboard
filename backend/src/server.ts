import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app= express();
const PORT = process.env.PORT || 5000;

// middleware   
app.use(cors());
app.use(express.json());

// routes
app.use('/api', orderRoutes);
app.use('/api', productRoutes);

//health check
app.get('/health', (req, res) => { 
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
