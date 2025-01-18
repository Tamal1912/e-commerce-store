import {create} from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast"

export const useProductStore=create((set)=>({
    products: [],
	loading: false,

    setProducts:(products)=> set({products}),

    createProduct: async(product) => {
        set({ loading: true });
        try {
			
			const response = await axios.post("/product",product);
             
			set({ products: response.data.products, loading: false });
			toast.success("Product created successfully");
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}

    },


	fetchAllProducts: async() => {

		set({ loading: true });
		try {
			const res=await axios.get("/product");
			set({products:res.data.products,loading:false});
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},

	fetchProductsByCategory: async(category) => {

		set({ loading: true });
		try {
			const response = await axios.get(`/product/category/${category}`);
			set({ products: response.data.products, loading: false });
			
		} catch (error) {
			set({loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}

	},

	toggleFeaturedProducts: async(productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/product/${productId}`);
			// this will update the isFeatured prop of the product
			console.log(response.data);
			
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},


	deleteProduct: async(productId) => {
		set({ loading: true });

		try {
			const res=await axios.delete(`/product/${id}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false
			}));
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},

	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/product/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
    


}))