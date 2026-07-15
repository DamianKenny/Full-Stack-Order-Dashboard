import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setSocketServer } from './utils/liveEvents';

dotenv.config();

const app= express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer });

setSocketServer(wsServer);

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

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
