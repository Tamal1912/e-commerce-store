import jwt from "jsonwebtoken";
import User from "../models/user.model.js" ;
import dotenv from "dotenv";    

dotenv.config();
export const protectRoute = async(req, res, next) => {
    
    try {
        const accessToken=req.cookies.access_token;
           
    
        if(!accessToken){
            return res.status(401).json({message:"no access token provided"});
        }

      try {
          const decoded=jwt.verify(accessToken,process.env.ACCESS_TOKEN);
                    
          const user=await User.findById(decoded.userId).select("-password");
                    
          if(!user){
              return res.status(401).json({message:"User not found"});
          }
  
          req.user=user;
          next();
      } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({message:"Access token expired"});
            throw error;
        }   
        res.status(401).json({message:"Invalid access token"});
      }

    } catch (error) {
        console.log("Error in protectRoute middleware");
        res.status(500).json({message:"Server Error",error:error.message});
    }

}

export const adminRoute=(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next();    
    }else{
        res.status(403).json({message:"Access Denied - Admin Only"});
    }
}