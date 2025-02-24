import React, { useContext, useEffect, useState, useMemo } from "react";
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
// import vector_1 from '../../images/vector_3.svg'
import vector_2 from '../../images/vector_4.svg'

function Dashboard() {
  const {loader, filteredCrops, FarmerOrders, loading} = UseHook()
  const {user} = useContext(AuthContext)

  const DAILY_ORDER_TREND_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/daily_order_trends/${user?.user_id}`
  const DAILY_SALES_TREND_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/daily_sales_trends/${user?.user_id}`
  const CROP_PERFOMANCE_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/monthly_sales_trends_by_crop/${user?.user_id}`

  const [totalSales, setTotalSales] = useState(0);
  const encodedUserId = encodeURIComponent(user.user_id);
  const market_Trend = `https://agrilink-backend-hjzl.onrender.com/agriLink/market-insights/${encodedUserId}/`
  
const [trend, setTrend] = useState([])
const [trendLoader, setTrendLoader] = useState(false)
const [SalesTrend, setSalesTrend] = useState([])
const [orderTrends, setOrderTrends] = useState([])
const [cropSales, setCropSales] = useState([])
const [saleMonths, setSaleMonths] = useState([])
const [cropSaleMonths, setCropSalesMonths] = useState([])


const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const [selectedMonth, setSelectedMonth] = useState(`${months[new Date().getMonth()]} ${new Date().getFullYear()}`);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' }); // Gets "Feb"
  const day = date.getDate(); // Gets day (e.g., 17)
  return `${month} ${day}`; // Returns "Feb 17"
};

// show month
const show_month = (index) => {
  if (index >= 0 && index < months.length) {
    return months[index];
  } else {
    return "Invalid month index";
  }
};

// total sales
useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/orders_for_farmer/${user?.user_id}`);
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

// fetch sales trends
const fetchSalesTrends = async()=>{
  try{
     const response = await axios(DAILY_SALES_TREND_URL)
     const {monthly_sales} = response.data
     setSalesTrend(monthly_sales)

    //  get sales months
     const getMonth = monthly_sales.map(sale => sale.month)
     setSaleMonths(getMonth)
  }catch(err){
    console.log(err)
  }
}

// fetch order trends
const fetchOrderTrends = async()=>{
  try{
   const response = await axios(DAILY_ORDER_TREND_URL)
   const {monthly_trends} = response.data
   setOrderTrends(monthly_trends)
  }catch(err){
    console.log(err)
  }
}

// fetch crop sales
const fetchCropSales = async()=>{
  try{
   const response = await axios(CROP_PERFOMANCE_URL)
   const {crop_sales} = response.data
   setCropSales(crop_sales)

  //  get sale months
  }catch(err){
    console.log(err)
  }
}

useEffect(()=>{
  fetchSalesTrends()
  fetchOrderTrends()
  fetchCropSales()
}, [])


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

// sales and order trends change
// Updated handleSaleOrderTrends to also handle BarData
const handleSaleOrderTrends = (e) => {
  const selectedMonthValue = e.target.value;
  setSelectedMonth(selectedMonthValue);

  // Handle Line/Area Chart (Sales and Orders)
  const selectedSalesTrend = SalesTrend.find(trend => trend.month === selectedMonthValue);
  const selectedOrderTrend = orderTrends.find(trend => trend.month === selectedMonthValue);

  if (selectedSalesTrend && selectedOrderTrend) {
    const dailySales = selectedSalesTrend.daily_sales.map(sale => sale.amount);
    const dailyOrders = selectedOrderTrend.daily_trends.map(trend => trend.count);
    const dates = selectedSalesTrend.daily_sales.map(sale => formatDate(sale.date));

    setChartData({
      series: [
        { name: "Revenue (UGX)", data: dailySales },
        { name: "Orders", data: dailyOrders },
      ],
      options: {
        ...chartData.options,
        xaxis: {
          ...chartData.options.xaxis,
          categories: dates,
          title: { text: "Days" },
        },
      },
    });
  }

  // Handle Bar Chart (Crop Sales)
  const selectedCropSales = cropSales.filter(crop => 
    crop.monthly_sales.some(sale => sale.month === selectedMonthValue)
  );

  if (selectedCropSales.length > 0) {
    const cropNames = selectedCropSales.map(crop => crop.crop_name);
    const cropRevenues = selectedCropSales.map(crop => 
      crop.monthly_sales.find(sale => sale.month === selectedMonthValue)?.amount || 0
    );

    setBarData(prev => ({
      ...prev,
      series: [{
        name: "Revenue(UGX)",
        data: cropRevenues,
      }],
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: cropNames, // Update x-axis with crop names
        },
      },
    }));
  }
};

useEffect(() => {
  const currentMonth = `${months[new Date().getMonth()]} ${new Date().getFullYear()}`;

  // Set default for Line/Area Chart
  const currentSalesMonthData = SalesTrend.find(trend => trend.month === currentMonth);
  const currentOrderMonthData = orderTrends.find(trend => trend.month === currentMonth);

  if (currentSalesMonthData && currentOrderMonthData) {
    const dailySales = currentSalesMonthData.daily_sales.map(sale => sale.amount);
    const dailyOrders = currentOrderMonthData.daily_trends.map(trend => trend.count);
    const dates = currentSalesMonthData.daily_sales.map(sale => formatDate(sale.date));

    setChartData({
      series: [
        { name: "Revenue(UGX)", data: dailySales },
        { name: "Orders", data: dailyOrders },
      ],
      options: {
        ...chartData.options,
        xaxis: {
          ...chartData.options.xaxis,
          categories: dates,
        },
      },
    });
  }

  // Set default for Bar Chart
  const currentCropSales = cropSales.filter(crop => 
    crop.monthly_sales.some(sale => sale.month === currentMonth)
  );

  if (currentCropSales.length > 0) {
    const cropNames = currentCropSales.map(crop => crop.crop_name);
    const cropRevenues = currentCropSales.map(crop => 
      crop.monthly_sales.find(sale => sale.month === currentMonth)?.amount || 0
    );

    setBarData(prev => ({
      ...prev,
      series: [{
        name: "Revenue(UGX)",
        data: cropRevenues,
      }],
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: cropNames, // Initial crop names
        },
      },
    }));
  }
}, [SalesTrend, orderTrends, cropSales]);


  // Line Chart Data
 
  // Memoize sales and order_trend arrays
  // const sales = useMemo(() => 
  //   SalesTrend.flatMap(trend => trend.daily_sales.map(daily => daily.amount)),
  //   [SalesTrend]
  // );

  // const order_trend = useMemo(() =>
  //   orderTrends.flatMap(trend => trend.daily_trends.map(daily => daily.count)),
  //   [orderTrends]
  // );

  // console.log('sales', sales, 'orders', order_trend);

  // Memoize chartData
  const [chartData, setChartData] = useState({
    series: [
       { name: "Revenue(UGX)", data: [] },
      { name: "Orders", data: [] },
    ],
    options: {
      chart: { id: "sales-orders-trends", toolbar: { show: false } },
      xaxis: { categories: [], title: { text: "Days" } }, // Default to showing days
      yaxis: { title: { text: "Revenue(UGX) and Orders" } },
      stroke: { curve: "smooth" },
      colors: ["#1E88E5", "#D32F2F"],
      legend: { position: "top", horizontalAlign: "right" },
      grid: { borderColor: "#f1f1f1" },
    },
  });

  // chart Bar Data
  const cropnames = useMemo(() =>
    filteredCrops.map(crop => crop.crop_name),
    [filteredCrops]
  )

  console.log(cropnames)
   // Initialize BarData state
  // Initialize BarData state (similar to chartData)
const [BarData, setBarData] = useState({
  series: [
    {
      name: "Revenue(UGX)",
      data: [],
    },
  ],
  options: {
    chart: {
      id: "crop-sales-trends",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: [], // Will be updated with crop names
      title: {
        text: "Crops",
      },
    },
    yaxis: {
      title: {
        text: "Revenue(UGX)",
      },
    },
    stroke: {
      curve: "smooth",
    },
    colors: ["#1E88E5"],
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f1f1",
    },
    
  },
});

  return (
    <>
    <div className="container-fluid">
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
      <div className="time mt-5 col-md-12 col-sm-12 p-2 text-center">
        <h6 className="text-center text-white"><strong>Stats Overview</strong></h6>
      </div>

      {/* Dashboard Metrics Chart */}
      <div className="row chart-container p-2">
        {/* <h3>Performance Overview</h3> */}

        <div className="dash_bar col-sm-12 bg-white p-2">
          <div className="perfom d-flex">
          <h6><strong>Perfomance Trend</strong></h6>
          <select id="autoSizingSelect" className="form-select w-50 ms-auto" onChange={handleSaleOrderTrends}>
          <option value={`${show_month(new Date().getMonth())} ${new Date().getFullYear()}`}>
            {show_month(new Date().getMonth())} {new Date().getFullYear()}
          </option>
          {saleMonths
            .filter((monthData) => {
              const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
              return !monthData.startsWith(currentMonth); // Exclude current month
            })
            .map((monthData) => (
              <option key={monthData} value={monthData}>
                {monthData}
              </option>
            ))}
</select>
          </div> 
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height="350"
        />
        </div>
       
        <div className="dash_bar col-sm-12 bg-white p-2">
  <div className="perfom d-flex">
    <h6><strong>Crop Performance</strong></h6>
    <select id="autoSizingSelect" className="form-select w-50 ms-auto" onChange={handleSaleOrderTrends} value={selectedMonth}>
      <option value={selectedMonth}>{selectedMonth}</option>
      {[...new Set([...saleMonths, ...cropSaleMonths].map(month => month))].map(month => (
        <option key={month} value={month}>{month}</option>
      ))}
    </select>
  </div> 
  <Chart
    options={BarData.options}
    series={BarData.series}
    type="bar"
    height="350"
  />
</div>

      
      </div>

      {/* uploaded crops */}
      <div className="recent_crops mt-4 p-2">
        <div className="row recent_text p-2">
          <h4 className="col-md-5 sm-12">Recently Uploaded Products</h4>
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
        image={`https://agrilink-backend-hjzl.onrender.com${image}`}
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
      <div className="market-insights mt-3">
        <h6 className="text-white text-center p-2 insight_summary_head">Insights Summary</h6>

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
              {crop_name}: <img src={vector_2}></img> <strong>UGX {average_price_per_kg}/ KG</strong> <i class="bi bi-arrow-up text-success"></i>
              </li>
                </>
              )
            })}
          
          </ul>

          )}
          </>)}
        </div>
      </div>

    </div>
    </>
  );
}

export default Dashboard;
