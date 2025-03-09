import { createContext, useState, useEffect, useRef } from 'react';
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
  const [cropLogs, setCropLogs] = useState([])
  const [selectMonthLogs, setSelectMonthLogs] = useState({views:0, purchases:0})
  const [prices, setPrices] = useState([])
  const [showNotificationPage, setShowNotificationPage] = useState(false);
  const [monthlySales, setMonthlySales] = useState([])
  const [salesTrend, setSalesTrend] = useState([])
  const [redirectLink, setRedirectLink] = useState('')
   
  const socketRef = useRef(null)
  const trendRef = useRef(null)
  const performanceRef = useRef(null)
  
  const navigate = useNavigate();

  useEffect(() => {
    const totalItems = addedItem.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalItems);
  }, [addedItem]);


// real-time crop logs
useEffect(() => {
  if (user) {  // Only establish WebSocket connection for farmers
    socketRef.current = new WebSocket(`wss://agrilink-backend-hjzl.onrender.com/ws/user_logs/`);
    socketRef.current.onopen = () => {
      console.log('WebSocket connection established for farmer');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'user_logs') {
        data.monthly_stats.map(stat =>(
          setCropLogs([stat])
        ))
        
        // Update selectMonthLogs if the selected month is in the new stats
        setSelectMonthLogs((prevLogs) => {
          const selectedMonthStat = data.monthly_stats.find(
            (stat) => stat.year === prevLogs.year && stat.month === prevLogs.month
          );

          if (selectedMonthStat) {
            return {
              views: selectedMonthStat.views,
              purchases: selectedMonthStat.purchases,
            };
          }

          return prevLogs;
        });
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection disconnected for farmer');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error for farmer:', error);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }
}, [user]);

// real time market-trends
useEffect(()=>{
  if(user){
    trendRef.current = new WebSocket('wss://agrilink-backend-hjzl.onrender.com/ws/market_trends/')

    trendRef.current.onopen =()=>{
      console.log('websockect conection established for market trends')
    }

    trendRef.current.onmessage = (event) => {
      console.log('market trends received', event.data);
      const data = JSON.parse(event.data); // Parse the entire event.data
      const marketTrend = data.market_trend; // Access market_trend
       console.log('current trends', marketTrend.farmer_pricing)
      
        setPrices(marketTrend.farmer_pricing); // Create a new array
      
  };

    trendRef.current.onclose = () => {
      console.log('WebSocket connection disconnected for market trends');
    };

    trendRef.current.onerror = (error) => {
      console.error('WebSocket error for market trends:', error);
    };

    return () => {
      if (trendRef.current) {
        trendRef.current.close();
      }
    };
  }
}, [user])

// real time crop perfomance
useEffect(() => {
  if (user) {
    performanceRef.current = new WebSocket('wss://agrilink-backend-hjzl.onrender.com/ws/crop-performance/');

    performanceRef.current.onopen = () => {
      console.log('WebSocket connection established for performance');
    };

    performanceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // Parse the WebSocket message

        // Validate the data structure before accessing properties
        if (data && typeof data === 'object') {
          if (data.type === 'payment_result') {
            console.log('payment_result', data);
            if (data.res?.charge_response?.status === 'success') {
              setRedirectLink(data.res.charge_response.data.link);
            }
          }

          // Check if monthly_sales exists in the data
          if (data.monthly_sales) {
            setMonthlySales(data.monthly_sales);
          }

          // Check if daily_monthly_sales exists and has monthly_sales
          if (data.daily_monthly_sales?.monthly_sales) {
            setSalesTrend(data.daily_monthly_sales.monthly_sales);
          }
        } else {
          console.error('Invalid WebSocket message format:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    performanceRef.current.onclose = () => {
      console.log('WebSocket connection disconnected for performance');
    };

    performanceRef.current.onerror = (error) => {
      console.error('WebSocket error for performance:', error);
    };

    return () => {
      if (performanceRef.current) {
        performanceRef.current.close();
      }
    };
  }
}, [user]);

 //user logs 
const handleViewLog = (id)=>{
  if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    socketRef.current.send(JSON.stringify({
      action: 'view',
      crop: id
    }));
  }
} 

//market trends
const marketrendUpload = (id)=>{
  if (trendRef.current && trendRef.current.readyState === WebSocket.OPEN) {
    trendRef.current.send(JSON.stringify({
      crop:id
    }))
  }
}
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
  } else {
    // Find the item in the cart
    const updatedItems = addedItem.map((cartItem) => {
      if (cartItem.id === item.id) {
        const newQuantity = cartItem.quantity > 1 ? cartItem.quantity - 1 : 1;
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });

    // Update the cart in state and local storage
    localStorage.setItem('cartItem', JSON.stringify(updatedItems));
    setAddedItem(updatedItems);

    // Update the total quantity (if needed)
    const newTotalQuantity = updatedItems.reduce((acc, cartItem) => {
      return acc + (cartItem.weight ? cartItem.weight.reduce((sum, w) => sum + w.quantity, 0) : cartItem.quantity);
    }, 0);
    setTotalQuantity(newTotalQuantity); // Ensure setTotalQuantity is defined in your context
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
    setNotificationCount,
    cropLogs, 
    setCropLogs,
    handleViewLog,
    marketrendUpload,
    selectMonthLogs, 
    setSelectMonthLogs,
    socketRef,
    performanceRef,
    prices, 
    setPrices,
    showNotificationPage, 
    setShowNotificationPage,
    monthlySales, 
    setMonthlySales,
    salesTrend, 
    setSalesTrend,
    redirectLink, 
    setRedirectLink
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
