import express from "express";
import { addToCart, removeAllfromCart, updateQuantity, getCartProducts } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();


router.get("/",protectRoute,addToCart)
router.get("/",protectRoute,removeAllfromCart);
router.get("/:id",protectRoute,updateQuantity);
router.get("/",protectRoute,getCartProducts);



export default router;