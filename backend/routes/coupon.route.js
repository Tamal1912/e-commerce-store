import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import { getCoupon, valiidateCoupon } from "../controllers/coupon.controller.js";


const router = express.Router();

router.get("/",protectRoute,getCoupon);
router.get("/",protectRoute,valiidateCoupon);

export default router;