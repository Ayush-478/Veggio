import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);
  
  // Load cart when user is authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get('https://veggio.onrender.com/api/users/cart');
          setCart(res.data);
          setError(null);
        } catch (err) {
          setError(err.response?.data?.message || 'Error loading cart');
        }
      } else {
        setCart(null);
      }
      setLoading(false);
    };
    
    loadCart();
  }, [isAuthenticated]);
  
  // Add item to cart
  const addToCart = async (foodItemId, quantity) => {
    try {
      const res = await axios.post('https://veggio.onrender.com/api/users/cart', { foodItemId, quantity });
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
      throw err;
    }
  };
  
  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      const res = await axios.put(`https://veggio.onrender.com/api/users/cart/${itemId}`, { quantity });
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating cart');
      throw err;
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(`https://veggio.onrender.com/api/users/cart/${itemId}`);
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing from cart');
      throw err;
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      const res = await axios.delete('https://veggio.onrender.com/api/users/cart');
      setCart({ ...cart, items: [], totalAmount: 0, totalCalories: 0 });
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error clearing cart');
      throw err;
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 