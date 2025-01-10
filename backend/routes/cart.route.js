import express from "express";
import { addToCart, removeAllfromCart, updateQuantity, getCartProducts } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();


router.post("/",protectRoute,(req,res,next)=>{
    console.log("endpoint");
    next()
},addToCart);
router.delete("/",protectRoute,removeAllfromCart);
router.put("/:id",protectRoute,updateQuantity);
router.get("/",protectRoute,getCartProducts);



export default router;