import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { updateQuantity } from "../../../backend/controllers/cart.controller";

export const useCartStore = create((set, get) => ({

  
  

  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,


  getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupon");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupon", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	clearCart: async () => {
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
  getCartItems: async () => {
    
    try {
      const res = await axios.get("/cart");
      console.log("getting cart items");
			set({ cart: res.data });
      
      
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			
		}
	},
  

  addToCart: async (product) => {
    try {

       const response=await axios.post("/cart", { productId: product._id });
        toast.success("Product added to cart");
        
        set((prevState) => {
            const existingItem = prevState.cart.find((item) => item._id === product._id);
            const newCart = existingItem
                ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                  )
                : [...prevState.cart, { ...product, quantity: 1 }];
            return { cart: newCart };
        });

        console.log(get().cart);
        
        get().calculateTotal();
    } catch (error) {
       console.log(error);
       
    }
},

  removeFromCart: async (productId) => {

    const res=await axios.delete(`/cart`,{data:{productId}});
    toast.success("Product removed from cart");
    set(prevState =>({
      cart:prevState.cart.filter(item => item._id !== productId)
    }))

    get().calculateTotal();
  },

  updateQuantity: async (productId, quantity) => {
     if(quantity=== 0){
      get().removeFromCart(productId);
      return;

     }

     const res=await axios.put(`/cart/${productId}`,{quantity});
     set(prevState =>({
      cart:prevState.cart.map(item => item._id === productId ? {...item,quantity}:item)
     }))

     get().calculateTotal();
  },

  calculateTotal: () => {
    const {cart,coupon}=get();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
     let {total}=subtotal;

    if(coupon){
        const discount=subtotal*(coupon.discountPercentage/100);
        total=subtotal-discount;
    }

    set({subtotal,total});

  },


}));
