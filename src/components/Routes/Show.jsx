import React from 'react'
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
function Show() {
  return (
    <>
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
