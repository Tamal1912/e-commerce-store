import Coupon from "../models/coupon.model.js";

export const getCoupon=async(req,res)=>{
    try {
        const coupon=await Coupon.findOne({userrId:req.user._id});
        res.json(coupon || null);
    } catch (error) {
        console.log("Error in getCoupon controller");
        res.status(500).json({message:"Server Error",error:error.message});        
    }
}

export const valiidateCoupon=async(req,res)=>{
    try {
        const code=req.body;
        const coupon= await Coupon.findOne({code:code,userId:req.user._id,isActive:true});
        
        if(!coupon){
            return res.status(404).json({message:"Coupon not found"});
        }

        if(coupon.expiryDate < new Date()){
            coupon.isActive=false;
            await coupon.save();
            return res.status(404).json({message:"Coupon Expired"});
        }

        res.json({
            message:"Coupon is Valid",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage,
        })
        
    } catch (error) {
        console.log("Error in valiidateCoupon controller");
        res.status(500).json({message:"Server Error",error:error.message});
        
    }
}