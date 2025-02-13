import React, { useContext, useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chart from "react-apexcharts";
import axios from "axios";
import "./Dashboard.css";
import UseHook from "../../CustomHook/UseHook";
import { AuthContext} from "../../Context/AuthContext";
import { Link } from "react-router-dom";
import moment from "moment";

function Dashboard() {
  const {loader, filteredCrops, FarmerOrders, loading} = UseHook()
  const {user} = useContext(AuthContext)
  const [totalSales, setTotalSales] = useState(0);
  const encodedUserId = encodeURIComponent(user.user_id);
  const market_Trend = `http://127.0.0.1:8000/agriLink/market-insights/${encodedUserId}/`
  
const [trend, setTrend] = useState([])
const [trendLoader, setTrendLoader] = useState(false)

// total sales
useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await axios.get(`http://127.0.0.1:8000/agriLink/orders_for_farmer/${user?.user_id}`);
          const orders = response.data.orders;

          let total = 0;
          orders.forEach(order => {
              // Check if the payment amount is a number and status is 'successful'
              const amount = parseFloat(order.payment.amount);
              if (!isNaN(amount) && order.payment.status === 'successful') {
                  total += amount;
              }
          });

          setTotalSales(total);
      } catch (error) {
          console.error('Error fetching farmer orders:', error);
      }
  };

  fetchData();
}, []);


  // fetch average prices
const fetchAveragePrice = async()=>{
  setTrendLoader(true)
  try{
     const response = await axios(market_Trend)
     const data = response.data
     setTrend(data)
     setTrendLoader(false)
  }catch(err){
    console.log('err', err)
  }
}
console.log(trend)
useEffect(()=>{
  fetchAveragePrice()
}, [])
  // Line Chart Data
  const [chartData] = useState({
    series: [
      {
        name: "Sales",
        data: [100, 120, 150, 170, 180, 200],
      },
      {
        name: "Orders",
        data: [50, 60, 80, 90, 100, 120],
      },
      {
        name: "Crop Trends",
        data: [30, 40, 50, 60, 70, 85],
      },
    ],
    options: {
      chart: {
        id: "sales-orders-trends",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        title: {
          text: "Months",
        },
      },
      yaxis: {
        title: {
          text: "Values",
        },
      },
      stroke: {
        curve: "smooth",
      },
      colors: ["#1E88E5", "#D32F2F", "#43A047"],
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  });


  // // Export Opportunities Data
  // const exportOpportunities = [
  //   { country: "Kenya", demand: "Maize, Beans", requirements: "Certificate of Origin" },
  //   { country: "Rwanda", demand: "Coffee", requirements: "Quality Inspection Report" },
  //   { country: "South Sudan", demand: "Rice, Bananas", requirements: "Customs Clearance" },
  // ];

  return (
    <>
      <h4 className='user_dashboard p-2'>Dashboard</h4>

      {/* Dashboard Stats */}
      <div className="row stats">
        <div className="stat_orders col-md-3 sm-12">
          <div className="img_nums">
            <i className="bi bi-truck text-success"></i>
            <span><strong>{FarmerOrders.length}</strong></span>
          </div>
          <h6>Total Orders</h6>
        </div>

        <div className="stat_buyers col-md-3 sm-12">
          <div className="img_nums">
            <i className="bi bi-tree-fill text-success"></i>
            <span><strong>{filteredCrops.length}</strong></span>
          </div>
          <h6>Total Crops</h6>
        </div>

        <div className="stat_sales col-md-3 sm-12">
          <div className="img_nums">
            <i className="bi bi-currency-exchange text-success"></i>
            <span><strong>UGX {totalSales.toLocaleString()}</strong></span>
          </div>
          <h6>Total Sales</h6>
        </div>
      </div>

      {/* Time Periods */}
      {/* <div className="time mt-5">
        <ul>
          <li>
            <i className="bi bi-calendar-check-fill"></i>
            <h5>Current Month</h5>
          </li>

          <li>
            <i className="bi bi-calendar-check-fill"></i>
            <h5>Last Month</h5>
          </li>

          <li>
            <i className="bi bi-calendar-check-fill"></i>
            <h5>Yearly</h5>
          </li>
        </ul>
      </div> */}

      {/* Dashboard Metrics Chart */}
      {/* <div className="chart-container bg-white p-2">
        <h3>Performance Overview</h3>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height="350"
        />
      </div> */}

      {/* uploaded crops */}
      <div className="recent_crops mt-4 p-2">
        <div className="row recent_text p-2">
          <h4 className="col-md-5 sm-12">Recently Uploaded Crops</h4>
          <div className="show_all col-md-4 ms-auto sm-12 text-white p-2 text-center">
            <span><Link to='/farmer/listings' className="text-decoration-none text-white">show All</Link></span>
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>

        {loader ? (<div className='crop_loader'></div>) : (
  <>
  {filteredCrops.length === 0 && (<>
    <div className="no_crops mt-5 text-center">
          <h5 className="text-muted">No crops found</h5>
          <i className="bi bi-tree-fill text-secondary" style={{ fontSize: "2rem" }}></i>
        </div>
  </>)}
   <div className="row crop mt-2">
      {filteredCrops.slice(0,3).map(crop => {
        const {id,crop_name, image} = crop
        return (
          <>
      <Card sx={{ maxWidth: 345 }} className="col-md-3 sm-12 crop_card">
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={`http://127.0.0.1:8000${image}`}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" className="crop_name">
          {crop_name}
        </Typography>
      </CardContent>
    </Card>
          </>
        )
      })}
      </div>
  </>
)} 
      </div>


      {/* recent orders */}
      <div className="recent_orders p-2 mt-4">
        <div className="row order_text p-2">
          <h4 className="col-md-4 sm-12">Recent Orders</h4>
          <div className="show_all col-md-4 ms-auto sm-12 text-white p-2 text-center">
            <span><Link to='/farmer/customer_orders' className="text-white text-decoration-none">show All</Link></span>
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>

        <div className="order-container mt-3">
        {loading ? (
        <div className="order_loading-container">
          <div className="spinner-border text-primary text-center" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-center">Fetching orders, please wait...</p>
        </div>
      ) : FarmerOrders.length === 0 ? (
        <div className="no-orders-container text-center">
          <h5 className="text-muted">No orders found</h5>
          <i className="bi bi-box2-heart text-secondary" style={{ fontSize: "2rem" }}></i>
        </div>
      ) : (
        <div className="cust_orders bg-white table-responsive mb-5 p-2">
          <table id="myTable" className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">ORDER ID</th>
                <th scope="col">Buyer Name</th>
                <th scope="col">District</th>
                <th scope="col">Payment</th>
                <th scope="col">Contact</th>
                <th scope="col">Status</th>
                <th scope="col">Created At</th>
              </tr>
            </thead>
            <tbody>
              {FarmerOrders.slice(0,5).map((order) => {
                const { order_id, buyer_name, status, district, contact, created_at } = order;
                 const orderTime = moment(created_at).fromNow()
                return (
                  <tr key={order_id}>
                    <td>{order_id}</td>
                    <td>{buyer_name}</td>
                    <td>{district}</td>
                    <td>{order.payment?.status}</td>
                    <td>{contact}</td>
                    <td>
                      {status === "Completed" ? (
                        <span className="text-success d-flex">
                          <i className="bi bi-check2-circle"></i> Completed
                        </span>
                      ) : status === "Cancelled" ? (
                        <span className="text-danger">Cancelled</span>
                      ) : status === "Pending" ? (
                        <span className="text-warning d-flex">
                          <i className="bi bi-arrow-counterclockwise"></i> Pending
                        </span>
                      ) : (
                        <span className="text-secondary">
                          <i className="fa fa-spinner"></i> Waiting
                        </span>
                      )}
                    </td>
                    <td>{orderTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>

      {/* Market Insights */}
      <div className="market-insights mt-5">
        <h3>Market Insights</h3>

        {/* Market Prices */}
        <div className="market-prices mb-4">
          <h5>Average Market Prices for your Products</h5>
          {trendLoader ? (<>
          <h5>Fetching Price Data...</h5>
          </>) : (<>
          {trend.length === 0 ? (<>
          <h4>No market Price Data Available</h4>
          </>) : (
          <ul>
            {trend.map(price =>{
              const {average_price_per_kg, crop_name} = price
              return (
                <>
              <li>
              {crop_name}: <i class="bi bi-bar-chart-fill text-success"></i> <strong>UGX {average_price_per_kg}/ KG</strong> <i class="bi bi-arrow-up text-success"></i>
              </li>
                </>
              )
            })}
          
          </ul>

          )}
          </>)}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
