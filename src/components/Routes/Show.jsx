import React, {useContext, useEffect} from 'react'
import '../Routes/show.css'
import {Route, Routes} from 'react-router-dom'
import PrivateRoute from '../PrivateRoute'
import ResponsiveAppBar from '../Navbar/Navbar'
import MacbookPro from '../Home/land'
import Signup from '../Authenticate/Signup'
import Login from '../Authenticate/Login'
import Dashboard from '../Farmer/Dashboard/Dashboard'
import Sidebar from '../Farmer/Sidebar/Sidebar'
import '../Routes/show.css'
import Listings from '../Farmer/Listings/Listings'
import Upload_List from '../Farmer/Listings/Upload_List'
import Detail from '../Farmer/Listings/Detail'
import Order from '../Farmer/Orders/order'
import Market_Insights from '../Farmer/Insights/Market_Insights'
import Recommend from '../Farmer/Recommendations/Recommend'
import FarmerProfile from '../Farmer/FarmerProfile/FarmerProfile'
import Logout from '../Authenticate/Logout'
import EditCrop from '../Farmer/Listings/EditCrop'
import ChangePassword from '../Farmer/changePassword/ChangePassword'
import FarmerNotifications from '../Farmer/FarmerNotifications/FamerNotifications'
import ProductDetail from '../Buyer/Product_Detail/ProductDetail'
import Cart from '../Buyer/Cart/Cart'
import ProductListing from '../Buyer/ProductListing/ProductListing'
import BuyerProfile from '../Buyer/BuyerProfile/BuyerProfile'
import BuyerPassword from '../Buyer/PasswordChange/BuyerPassword'
import BuyerDashboard from '../Buyer/BuyerDasboard/BuyerDashboard'
import BuyerOrder from '../Buyer/BuyerOrder/BuyerOrder'
import Info from '../Farmer/FarmerInfo/Info'
import FarmerListing from '../Buyer/FarmerListing/FarmerListing'
import Checkout from '../Buyer/Checkout/Checkout'
import { onMessage } from 'firebase/messaging';
import tokenGeneration from '../Authenticate/firebase'
import toast, { Toaster } from 'react-hot-toast';
import { AuthContext } from '../Context/AuthContext'
import axios from 'axios'


function Show() {
  const { messaging, generateToken} = tokenGeneration()
  const {user, setNotifications, setNotificationCount, notifications, notificationCount} = useContext(AuthContext)

  const fetchNotificationCount = async () => {
    try {
      const encodedUserId = encodeURIComponent(user.user_id);
      const response = await axios.get(`http://127.0.0.1:8000/agriLink/user_notifications/${encodedUserId}`);
      const unreadCount = response.data.notifications.filter((notif) => !notif.is_read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user?.is_farmer || user?.is_buyer) {
      fetchNotificationCount();
    }
  }, [user]);

  useEffect(() => {
    generateToken();
  
    const unsubscribe = onMessage(messaging, (payload) => {
      if (payload.notification && payload.notification.body) {
        const newNotification = {
          user: user?.user_id,
          message: payload.notification.body,
        };
  
        toast(payload.notification.body);
        setNotifications((prev) => [...prev, newNotification]);
  
        // Ensure `notifications` is used to calculate unread count
        setNotificationCount((prevCount) => prevCount + 1);
      } else {
        console.error("Notification payload is incorrect or missing");
      }
    });
  
    return () => unsubscribe(); // Cleanup function to avoid memory leaks
  }, [messaging, generateToken, setNotifications, setNotificationCount, notifications]);

  return (
    <>
    <Toaster position='top-right'/> 
     <ResponsiveAppBar/>
     <Routes>

      {/* public routes */}
   <Route path='/' element={<MacbookPro/>}/> 
    <Route path='/signup' element={<Signup/>}/>
    <Route path='/login' element={<Login/>}/>
    
    <Route path='/farmer/*' element={
      
<PrivateRoute>
    <div className="window">
     <Sidebar/>
      <div className="content">
      <Routes>
      <Route path='/farmer_additional_info' element={<Info/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='listings'  element={<Listings/>}/>
        <Route path='upload_crop' element={<Upload_List/>}/>
        <Route path='detail/:id' element={<Detail/>}/>
        <Route path='edit_crop/:id' element={<EditCrop/>}/>
        <Route path='customer_orders' element={<Order/>}/>
        <Route path='insights' element={<Market_Insights/>}/>
        <Route path='recommendations' element={<Recommend/>}/>
        <Route path='profile' element={<FarmerProfile/>}/>
        <Route path='logout' element={<Logout/>}/>
        <Route path='change-password' element={<ChangePassword/>}/>
        <Route path='notification' element={<FarmerNotifications/>}/>
      </Routes>
      </div>
    </div>
</PrivateRoute>
    }/>

    {/* buyer routes */}
    <Route path='/buyer/*' element={
      <PrivateRoute>
     <div className='buyer_content'>
      <Routes>
        <Route path='product_detail/:id' element={<ProductDetail/>}/>
        <Route path='cart' element={<Cart/>}/>
        <Route path='profile' element={<BuyerProfile/>}/>
        <Route path='logout' element={<Logout/>}/>
        <Route path='change-password' element={<BuyerPassword/>}/>
        <Route path='dashboard' element={<BuyerDashboard/>}/>
        <Route path='orders' element={<BuyerOrder/>}/>
        <Route path='all_farmers' element={<FarmerListing/>}/>
        <Route path='farmer_product_listing/:id' element={<ProductListing/>}/>
        <Route path='checkout' element={<Checkout/>}/>
      </Routes>
     </div>
      </PrivateRoute>

    }/>

     </Routes>
    </>
  )
}

export default Show
