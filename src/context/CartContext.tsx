import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreDeliveryZone } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryArea: 'inside_sandwip' | 'outside_sandwip';
  selectedZoneId?: string;
  setDeliveryArea: (area: 'inside_sandwip' | 'outside_sandwip') => void;
  setSelectedZoneId: (zoneId?: string) => void;
  getDeliveryCharge: (chargeInside?: number, chargeOutside?: number, deliveryZones?: StoreDeliveryZone[]) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jihan_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryArea, setDeliveryArea] = useState<'inside_sandwip' | 'outside_sandwip'>('inside_sandwip');
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem('jihan_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor, selectedSize }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getDeliveryCharge = (chargeInside: number = 0, chargeOutside: number = 130, deliveryZones?: StoreDeliveryZone[]) => {
    if (selectedZoneId && deliveryZones && deliveryZones.length > 0) {
      const match = deliveryZones.find(z => z.id === selectedZoneId && z.enabled);
      if (match) {
        return match.charge;
      }
    }
    return deliveryArea === 'inside_sandwip' ? chargeInside : chargeOutside;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryArea,
        selectedZoneId,
        setDeliveryArea,
        setSelectedZoneId,
        getDeliveryCharge,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
