import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import orderRoutes from "./routes/orderRoutes.js";
import client from "prom-client";   // ✅ Correct ESM import

dotenv.config();

const app = express();

/* ---------------------------
    Prometheus Monitoring Setup
--------------------------- */

// Create a Prometheus Registry
const register = new client.Registry();

// Collect default Node.js metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({ register });

// Metrics Endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ---------------------------
    CORS Setup
--------------------------- */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.includes("localhost")) return callback(null, true);
      if (/^https?:\/\/[a-zA-Z0-9.-]+$/.test(origin))
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------------------------
   API Routes
--------------------------- */
app.use("/api/orders", orderRoutes);

/* ---------------------------
    Server + Database
--------------------------- */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
