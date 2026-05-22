import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('catalog_cart');
    return local ? JSON.parse(local) : [];
  });
  const [discount, setDiscount] = useState(() => {
    const local = localStorage.getItem('catalog_discount');
    return local ? parseInt(local) : 0;
  });

  useEffect(() => localStorage.setItem('catalog_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('catalog_discount', discount.toString()), [discount]);

  const addToCart = (product, quantity) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.indeks.toLowerCase() === product.indeks.toLowerCase());
      if (idx > -1) {
        const newCart = [...prev];
        newCart[idx].qty += quantity;
        return newCart;
      }
      return [...prev, { ...product, qty: quantity, id: Date.now() }];
    });
  };

  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.cena * item.qty), 0);
    const discountAmount = subtotal * (discount / 100);
    return { subtotal, discountAmount, total: subtotal - discountAmount };
  }, [cart, discount]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, discount, setDiscount, totals }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);