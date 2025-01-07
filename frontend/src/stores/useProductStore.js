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

    }

}))