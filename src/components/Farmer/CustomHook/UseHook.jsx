import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';

function UseHook() {
    const {user} = useContext(AuthContext)
    const encodedUserId = encodeURIComponent(user.user_id);
  const [crops, setCrops] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    next:null,
    previous:null,
    count:0
  }
  )
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loader, setLoader] = useState(false)
  const [FarmerOrders, setFarmerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const FarmerCropsUrl = `http://127.0.0.1:8000/agriLink/farmer/${encodedUserId}`
  const farmer_order_url = `http://127.0.0.1:8000/agriLink/orders_for_farmer/${encodedUserId}`;

// fetch crops
  const Fetch_Farmer_crops = async ()=>{
    try{
      setLoader(true)
    const response = await axios(FarmerCropsUrl)
    const {results, next, previous, count} = response.data
    setCrops(results.crops)
    setFilteredCrops(results.crops)
    setLoader(false)
    setPagination({next, previous, count})
    }catch (err){
      console.log(err)
    }
  }

//   fetch orders
  const fetch_farmer_orders = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios(farmer_order_url);
      const { orders } = response.data;
      setFarmerOrders(orders);
    } catch (error) {
      console.error("Error fetching farmer orders:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  // handle current page
  const handlePageChange = (url, direction) => {
    if (url) {
      axios
        .get(url)
        .then((response) => {
          const { results, next, previous, count } = response.data;
          setCrops(results.crops);
          setFilteredCrops(results.crops);
          setPagination({ next, previous, count });
          setCurrentPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(()=>{
    Fetch_Farmer_crops()
    fetch_farmer_orders() 
  }, [])
  return {
    crops, currentPage, pagination, loader, filteredCrops, setFilteredCrops, setCrops, handlePageChange, FarmerOrders, loading, setFarmerOrders
  }
}

export default UseHook
