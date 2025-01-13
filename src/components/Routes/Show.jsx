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

     </Routes>
    </>
  )
}

export default Show
