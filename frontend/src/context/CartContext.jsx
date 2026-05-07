import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [lastAddedItem, setLastAddedItem] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const toNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d.-]/g, '');
            return cleaned ? Number(cleaned) : 0;
        }
    };

    const addToCart = (product, quantity = 1) => {
        const normalizedProduct = {
            ...product,
            price: toNumber(product.price)
        };

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === normalizedProduct.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === normalizedProduct.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...normalizedProduct, quantity }];
        });
        
        setLastAddedItem(normalizedProduct);
        setShowSuccessModal(true);
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const cartTotal = cart.reduce((total, item) => {
        const price = toNumber(item.price);
        return total + (price * (item.quantity || 0));
    }, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartCount, 
            cartTotal,
            lastAddedItem,
            showSuccessModal,
            setShowSuccessModal
        }}>
            {children}
        </CartContext.Provider>
    );
};
