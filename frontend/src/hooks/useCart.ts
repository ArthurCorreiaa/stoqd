import { useState } from 'react';

export function useCart() {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing && existing.cartQuantity >= product.quantity) {
        alert(`Estoque máximo atingido para ${product.name}!`);
        return prev;
      }
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      if (product.quantity < 1) { 
        alert(`O produto ${product.name} está esgotado!`); 
        return prev; 
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty < 1 || newQty > item.quantity) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => {
    const price = Number(item.activePrice || item.sellingPrice || 0);
    return acc + (price * item.cartQuantity);
  }, 0);

  return { cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal };
}