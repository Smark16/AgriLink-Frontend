import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';

function UseHook() {
  // Use context at the top to ensure it's always called
  const { user } = useContext(AuthContext);

  const [crops, setCrops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loader, setLoader] = useState(false);
  const [FarmerOrders, setFarmerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ user:user? user.user_id :'', image: null, contact: 0, location: '', bio: '', specialisation:[], farmName:'',});
  const [previewImage, setPreviewImage] = useState(null);

  // URLs - only construct if user is available
  const FarmerCropsUrl = user ? `http://127.0.0.1:8000/agriLink/farmer/${encodeURIComponent(user.user_id)}` : '';
  const farmer_order_url = user ? `http://127.0.0.1:8000/agriLink/orders_for_farmer/${encodeURIComponent(user.user_id)}` : '';
  const profile_url = user ? `http://127.0.0.1:8000/agriLink/single_profile/${encodeURIComponent(user.user_id)}` : '';

  // Fetch crops
  const Fetch_Farmer_crops = async () => {
    if (!user) return;
    try {
      setLoader(true);
      const response = await axios.get(FarmerCropsUrl);
      const { results, next, previous, count } = response.data;
      setCrops(results.crops);
      setFilteredCrops(results.crops);
      setPagination({ next, previous, count });
    } catch (err) {
      console.error("Error fetching farmer crops:", err);
    } finally {
      setLoader(false);
    }
  };

  // Fetch orders
  const fetch_farmer_orders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await axios.get(farmer_order_url);
      const { orders } = response.data;
      setFarmerOrders(orders);
    } catch (error) {
      console.error("Error fetching farmer orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (url, direction) => {
    if (url && user) {
      axios.get(url)
        .then((response) => {
          const { results, next, previous, count } = response.data;
          setCrops(results.crops);
          setFilteredCrops(results.crops);
          setPagination({ next, previous, count });
          setCurrentPage(prev => direction === "next" ? prev + 1 : prev - 1);
        })
        .catch(err => console.error("Error changing page:", err));
    }
  };

  // Fetch profile
  const fetch_profile = async () => {
    if (!user) return;
    try {
      const response = await axios.get(profile_url);
      const data = response.data;
      setPreviewImage(data.image);
      setFormData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    if (user) {
      Fetch_Farmer_crops();
      fetch_farmer_orders();
      fetch_profile();
    }
  }, [user]);

  return {
    crops, 
    currentPage, 
    pagination, 
    loader, 
    filteredCrops, 
    setFilteredCrops, 
    setCrops, 
    handlePageChange, 
    FarmerOrders, 
    loading, 
    setFarmerOrders, 
    previewImage, 
    formData, 
    setFormData, 
    setPreviewImage, 
    fetch_profile
  };
}

export default UseHook;