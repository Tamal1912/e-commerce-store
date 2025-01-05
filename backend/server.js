import express from "express"
import dotenv from "dotenv"
import authRoutes from './routes/auth.route.js'
import cookieParser from "cookie-parser"   
import { connectDB } from "./lib/db.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"


dotenv.config()

const app=express()

const PORT=process.env.PORT || 5000

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes)
app.use("/api/product",productRoutes)
app.use("api/cart",cartRoutes)
app.use("api/coupon",couponRoutes)

app.listen(PORT,()=>{
    console.log(`server started - http://localhost:${PORT}`);
    connectDB()
    
})

