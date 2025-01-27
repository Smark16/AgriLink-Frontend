import React from 'react'

function listTest() {

  // Increment product quantity
  const incrementQuantity = (item, weightIndex = null) => {
    setAddedItem(prevItems => {
      const updatedItems = prevItems.map((cartItem) => {
        if (cartItem.id === item.id) {
          if (cartItem.weight && weightIndex !== null) {
            // Handling weight-specific quantity
            const newWeight = [...cartItem.weight];
            newWeight[weightIndex] = {
              ...newWeight[weightIndex],
              quantity: newWeight[weightIndex].quantity + 1
            };
            const newQuantity = newWeight.reduce((sum, w) => sum + w.quantity, 0);
            return { ...cartItem, weight: newWeight, quantity: newQuantity };
          } else {
            // Handling regular quantity
            return { ...cartItem, quantity: cartItem.quantity + 1 };
          }
        }
        return cartItem;
      });
  
      // Update local storage
      localStorage.setItem('cartItem', JSON.stringify(updatedItems));
  
      // Update total quantity
      const newTotalQuantity = updatedItems.reduce((acc, cartItem) => {
        return acc + (cartItem.weight ? cartItem.weight.reduce((sum, w) => sum + w.quantity, 0) : cartItem.quantity);
      }, 0);
      setTotalQuantity(newTotalQuantity);
  
      return updatedItems;
    });
  };
  
  // Decrement product quantity
  const decrementQuantity = (item, weightIndex = null) => {
    setAddedItem(prevItems => {
      const updatedItems = prevItems.map((cartItem) => {
        if (cartItem.id === item.id) {
          if (cartItem.weight && weightIndex !== null) {
            // Handling weight-specific quantity
            const newWeight = [...cartItem.weight];
            if (newWeight[weightIndex].quantity > 1) {
              newWeight[weightIndex] = {
                ...newWeight[weightIndex],
                quantity: newWeight[weightIndex].quantity - 1
              };
            }
            const newQuantity = newWeight.reduce((sum, w) => sum + w.quantity, 0);
            return { ...cartItem, weight: newWeight, quantity: newQuantity };
          } else if (cartItem.quantity > 1) {
            // Handling regular quantity
            return { ...cartItem, quantity: cartItem.quantity - 1 };
          }
        }
        return cartItem;
      });
  
      // Update local storage
      localStorage.setItem('cartItem', JSON.stringify(updatedItems));
  
      // Update total quantity
      const newTotalQuantity = updatedItems.reduce((acc, cartItem) => {
        return acc + (cartItem.weight ? cartItem.weight.reduce((sum, w) => sum + w.quantity, 0) : cartItem.quantity);
      }, 0);
      setTotalQuantity(newTotalQuantity);
  
      return updatedItems;
    });
  };
  
  return (
    <div>
      
    </div>
  )
}

export default listTest
