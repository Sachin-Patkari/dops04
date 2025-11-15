import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
const client = require("prom-client");

// Create a Prometheus Registry
const register = new client.Registry();

// Collect default Node.js metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({ register });
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});


const app = express();

/**
 * ✅ CORS Setup (Permanent & Safe)
 * - Allows all origins in development (localhost)
 * - Allows the same host/domain dynamically (for EC2 or domain)
 * - Works even if public IP changes
 */
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like curl or same-origin requests), allow
    if (!origin) return callback(null, true);

    // Allow localhost (for local dev)
    if (origin.includes('localhost')) return callback(null, true);

    // Allow requests from same EC2 or domain (matches its own host)
    if (/^https?:\/\/[a-zA-Z0-9.-]+$/.test(origin)) return callback(null, true);

    // Otherwise reject
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// API routes
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
