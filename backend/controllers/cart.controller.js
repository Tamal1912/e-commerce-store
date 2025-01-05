import Product from "../models/product.model.js";

export const addToCart=async(req,res)=>{
    try {
        const {productId}=req.body;
        const user=req.user;
        
        const existingProduct=user.cartItems.find(item => item.id === productId);
        if(existingProduct){
           existingProduct.quantity+=1;
        }else{
             user.cartItems.push(productId);
        } 

        await user.save();

        res.json(user.cartItems);

    } catch (error) {
        console.log("Error in addToCart controller");
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

export const removeAllfromCart=async(req,res)=>{
    try {
        const {productId}=req.body;
        const user=req.user;
        
        if(!productId){
           user.cartItems=[];
        }else{
            user.cartItems=user.cartItems.filter(item => item.id !== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllfromCart controller");
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

export const updateQuantity=async(req,res)=>{
    try {
        const {id:productId}=req.params;
        const {quantity}=req.body;
        const user=req.user;

        const existingProduct=user.cartItems.find(item => item.id === productId);

        if(existingProduct){
            if(quantity===0){
                user.cartItems=user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems); 
            }
            existingProduct.quantity=quantity;
            await user.save();
            res.json(user.cartItems);
        }else{
            res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
        console.log("Error in updateQuantity controller");
        res.status(500).json({message:"Server Error",error:error.message});        
    }
}

export const getCartProducts=async(req,res)=>{
    try {
        const products=await Product.find({$id:{$in:req.user.cartItems}});

        //add quantity fro each product
        const cartItems=products.map(product => {
         const item=req.user.cartItems.find(item => item.id === product.id);
         return {...product.toJSON(),quantity:item.quantity};
        })

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller");
        res.status(500).json({message:"Server Error",error:error.message});        
    }
}