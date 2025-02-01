import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => JSON.parse(localStorage.getItem('authtokens')) || null);
  const [user, setUser] = useState(() => (authTokens ? jwtDecode(authTokens.access) : null));
  const [loading, setLoading] = useState(true);
  const [FarmerNotification, setFarmerNotification] = useState()
  const [notifications, setNotifications] = useState([])
  const [addedItem, setAddedItem] = useState(() => {
    const storedItems = JSON.parse(localStorage.getItem('cartItem')) || [];
    return storedItems;
  });
    const [selectedQuantity, setSelectedQuantity] = useState(
      JSON.parse(localStorage.getItem('quantity')) || 0
    );
  const [totalQuantity, setTotalQuantity] = useState(null)
  const [quantity, setQuantity] = useState(1); // For increment/decrement
  const [weightArray, setWeightArray] = useState([])
  const [weightQuantity, setWeightQuantity] = useState(null)
  const [activatedAddress, setActivatedAddress] = useState({})
   const [notificationCount, setNotificationCount] = useState(0);
   
  const navigate = useNavigate();

  useEffect(() => {
    const totalItems = addedItem.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalItems);
  }, [addedItem]);
  

  // Update handleCart
  const handleCart = (item) => {
    setAddedItem(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // If the item exists, update or add new weights
        const newWeights = item.weight || [];
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, weight: [...(i.weight || []), ...newWeights] }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1, weight: item.weight || [] }]; // Here we manage weights array
      }
    });
  
    const totalItems = addedItem.reduce((sum, item) => sum + (item.quantity || 0) + (item.weight ? item.weight.reduce((wSum, w) => wSum + w.quantity, 0) : 0), 0);
    setTotalQuantity(totalItems);
  
    localStorage.setItem('cartItem', JSON.stringify(addedItem));
  };

  // Increment product quantity
const incrementQuantity = (item) => {
  if (item.weight && item.weight.length > 0) {
    // This should ideally update the weight quantity, but since we can't directly modify weights here:
    console.warn("Incrementing weight quantity not directly handled here. Update in Weights component.");
  } else {
    const updatedItems = addedItem.map((cartItem) => 
      cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
    );
    localStorage.setItem('cartItem', JSON.stringify(updatedItems));
    setAddedItem(updatedItems);
    
    // Update total quantity
    const newTotalQuantity = updatedItems.reduce((acc, cartItem) => {
      return acc + (cartItem.weight ? cartItem.weight.reduce((sum, w) => sum + w.quantity, 0) : cartItem.quantity);
    }, 0);
    setTotalQuantity(newTotalQuantity);
  }
};

// Decrement product quantity
const decrementQuantity = (item) => {
  if (item.weight && item.weight.length > 0) {
    console.warn("Decrementing weight quantity not directly handled here. Update in Weights component.");
  } else if (item.quantity > 1) {
    const updatedItems = addedItem.map((cartItem) => 
      cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
    );
    localStorage.setItem('cartItem', JSON.stringify(updatedItems));
    setAddedItem(updatedItems);
    
    // Update total quantity
    const newTotalQuantity = updatedItems.reduce((acc, cartItem) => {
      return acc + (cartItem.weight ? cartItem.weight.reduce((sum, w) => sum + w.quantity, 0) : cartItem.quantity);
    }, 0);
    setTotalQuantity(newTotalQuantity);
  }
};

// increament product weight quantity
const IncrementWeightQuantity = (item, weightIndex) => {
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
          
          setWeightQuantity(newWeight[weightIndex].quantity)
          // Calculate total quantity
          const newQuantity = newWeight.reduce((sum, w) => sum + w.quantity, 0);
          setWeightArray(newWeight)
          // Return updated cart item
          return { 
            ...cartItem, 
            weight: newWeight, 
            quantity: newQuantity 
          };
        }
      }
      return cartItem;
    });

    // Update local storage
    localStorage.setItem('cartItem', JSON.stringify(updatedItems));

    // Update total quantity in context or state if needed
    setTotalQuantity(prevTotal => prevTotal + 1); // Increment by 1

    return updatedItems;
  });
};

// decreament product weight quantity
const decrementWeightQuantity = (item, weightIndex)=>{
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
}

  // update cart quantity
  // const updateCartItem = (product, newQuantity) => {
  //   setAddedItem(prevItems => {
  //     const updatedItems = prevItems.map(item => 
  //       item.id === product.id ? { ...item, quantity: newQuantity } : item
  //     );
  //     localStorage.setItem('cartItem', JSON.stringify(updatedItems));
  //     return updatedItems;
  //   });
  //   const newCount = addedItem.reduce((sum, item) => sum + (item.quantity || 0), 0);
  //   setTotalQuantity(newCount);
  // };

  useEffect(() => {
    const storedTokens = JSON.parse(localStorage.getItem('authtokens'));
    if (storedTokens) {
      const decodedUser = jwtDecode(storedTokens.access);
      setAuthTokens(storedTokens);
      setUser(decodedUser);
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        navigate(lastPath);  // Redirect to last accessed page if available
        localStorage.removeItem('lastPath');  // Clear after redirecting
      }
    }
    setLoading(false);
  }, [navigate]);

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authtokens');
    localStorage.removeItem('lastPath');
    navigate('/login');
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    logoutUser,
    FarmerNotification, 
    setFarmerNotification,
    handleCart,
    totalQuantity,
    addedItem,
    setAddedItem,
    quantity, 
    setQuantity,
    setTotalQuantity,
    incrementQuantity,
    decrementQuantity,
    IncrementWeightQuantity,
    decrementWeightQuantity,
    selectedQuantity, 
    setSelectedQuantity,
    weightArray,
    weightQuantity,
    activatedAddress, 
    setActivatedAddress,
    notifications, 
    setNotifications,
    notificationCount, 
    setNotificationCount
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
