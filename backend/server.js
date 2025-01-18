import express from "express"
import dotenv from "dotenv"
import authRoutes from './routes/auth.route.js'
import cookieParser from "cookie-parser"   
import { connectDB } from "./lib/db.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"

import analyticsRoutes from "./routes/analytic.route.js"
import cors from 'cors';

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173', // Adjust to match your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json({ limit: "30mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
    console.log(`Server started - http://localhost:${PORT}`);
    connectDB();
});
