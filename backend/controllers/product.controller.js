import {redis} from "../lib/redis.js"
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async(req, res) => {
    try {
        const product=await Product.find({});  //find all products
        res.json(product);
    } catch (error) {
        console.log("Error in getAllProducts controller");
        res.status(500).json({message:"Server Error",error:error.message});
        
    }
}

export const getFeaturedProducts = async(req, res) => {
    try {
        let featuredProducts= await redis.get("featuredProducts"); //get featured products from redis
        if(featuredProducts){
           return res.json(JSON.parse(featuredProducts));
        }
         
         //lean() method is used to convert mongoose object to javascript object for better performance,
        // not to use Everytime 

        featuredProducts=await Product.find({isFeatured:true}).lean();//find featured products
        if(!featuredProducts){
          return res.status(404).json({message:"No Featured Products found"});
        }
        

        //store featured products in redis for faster access
        await redis.set("featuredProducts",JSON.stringify(featuredProducts));
        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller");
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

export const createProduct=async(req,res)=>{

   
    try {
		const { name, description, price, image, category } = req.body;
        if (!name || !description || !price || !image || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

		let cloudinaryResponse = null;

		if (image) {
            
           cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            })
		}

		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
			category,
		});

		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
}

export const deleteProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({message:"Product not found"});
        }

        if(product.image){
            const publicId=product.image.split("/").pop().split(".")[0];

            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloudinary ");
            } catch (error) {
                console.log("Error deleting image from cloudinary");
            }

            await Product.findByIdAndDelete(req.params.id);
            return res.status(200).json({message:"Product deleted successfully"});
        }
    } catch (error) {
        console.log("Error in deleteProduct controller");
        res.status(500).json({message:"Server Error",error:error.message});
    }
}


export const getRecommendedProducts=async(req,res)=>{
    try {
        const product=await Product.aggregate([
            {
                $sample:size(3)
            },
            {
                $project:{
                    name:1,
                    description:1,
                    price:1,
                    image:1,
                    price:1,
                }
            }
        ])

        res.json(product);
    } catch (error) {
        console.log("Error in recommendedProducts controller");
        res.status(500).json({message:"Server Error",error:error.message});        
    }
}

export const getProductsByCategory=async(req,res)=>{
    const {category}=req.params;
    try {
        const product=await Product.find({category});
        res.json(product);
    } catch (error) {
        console.log("Error in getProductsByCategory controller");
        res.status(500).json({message:"Server Error",error:error.message});        
    }
}

export const toggleFeaturedProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id);
        if(product){
            product.isFeatured=!product.isFeatured;
            let updatedProduct=await product.save();
            await updateFeaturedProductCache();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
        
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller");
        res.status(500).json({message:"Server Error",error:error.message});
        
    }
}


//update featured product cache function
const updateFeaturedProductCache=async function(){
    try {

        //lean() method is used to convert mongoose object to javascript object for better performance,
        // not to use Everytime 

        const featuredProducts=await Product.find({isFeatured:true}).lean();
        await redis.set("featuredProducts",JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured product cache");  
    }
    
}