import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import Chart from "react-apexcharts";
import '../Insights/market.css'
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";

const Market_Insights = () => {
  const {user} = useContext(AuthContext)
  const encodedUserId = encodeURIComponent(user.user_id);
  
  const farmer_crops_url = `http://127.0.0.1:8000/agriLink/farmer/${encodedUserId}`
  
  const [farmerCrops, setFarmerCrops] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [salesTrend, setSalesTrend] = useState([])
  const [crop_id, setCrop_id] = useState(null); 
  const [cropLogs, setCropLogs] = useState([])
  const [selectedMonthData, setSelectedMonthData] = useState({ revenue: 0, quantity: 0 });
  const [selectMonthLogs, setSelectMonthLogs] = useState({views:0, purchases:0})
  const [monthlysalesTrend, setMonthlySalesTrend] = useState([{revenue:0}])
  const [salesPerformance, setSalesPerformance] = useState(null);
  const [farmerPricing, setFarmerPricing] = useState({})

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  function getFormattedDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Example usage for the current date
let today = getFormattedDate();

  // show month
  const show_month = (index) => {
    if (index >= 0 && index < months.length) {
      return months[index];
    } else {
      return "Invalid month index";
    }
  };

  const fetchFarmerCrops = async () => {
    try {
      const response = await axios(farmer_crops_url);
      const { results } = response.data;
      setFarmerCrops(results.crops);
      if (results.crops.length > 0) {
        setCrop_id(results.crops[0].id); // Set crop_id once crops are fetched
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  // change crop view
  const handleCropChange = (id) => {
    if (id) {
      setCrop_id(id);
    }
  };

  // monthly sales
  const monthly_sales = async () => {
    if (crop_id) {
      try {
        const response = await axios(`http://127.0.0.1:8000/agriLink/monthly_sales_overview/${crop_id}`);
        const data = response.data;
        setMonthlySales(data);
        setSelectedMonthData({ revenue: 0, quantity: 0 });
      } catch (err) {
        console.log('err', err);
      }
    }
  };

  // sales trend
  const sales_trend = async () => {
    if (crop_id) {
      try {
        const response = await axios(`http://127.0.0.1:8000/agriLink/monthly_sales_overview/${crop_id}`);
        const data = response.data;
        setSalesTrend(data)
        setMonthlySalesTrend([{revunue:0}])
        calculatePerformance(data);
      } catch (err) {
        console.log('err', err);
      }
    }
  };

  // calculate sales perfomance
  const calculatePerformance = (data) => {
    if (data.length >= 2) {
      const currentMonth = data[data.length - 1].total_quantity_sold; // Assuming the last entry is the current month
      const previousMonth = data[data.length - 2].total_quantity_sold;

      if (previousMonth === 0) {
        setSalesPerformance("N/A"); // Handle division by zero
      } else {
        const performance = ((currentMonth - previousMonth) / previousMonth) * 100;
        setSalesPerformance(performance.toFixed(1)); // Keep one decimal place
      }
    }
  };

  // userinterlogs 
  const crop_logs = async () =>{
    if(crop_id){
      try{
         const response = await axios(`http://127.0.0.1:8000/agriLink/crop_actions/stats/${crop_id}`)
         const data = response.data;
         setCropLogs(data.monthly_stats)
         setSelectMonthLogs({views:0, purchases:0})
      }catch(err){
        console.log('err', err)
      }
    }
  }

  // farmer pricing
  const FarmerPricing = async()=>{
    if(crop_id){
      try{
        const response = await axios(`http://127.0.0.1:8000/agriLink/crop_market_insights/${crop_id}`)
        const data = response.data
        setFarmerPricing(data)
      }catch(err){
        console.log('err', err)
      }
    }
  }

  // Selected month data
  const handleMonthChange = (event) => {
    const selectedMonthIndex = parseInt(event.target.value, 10); // Ensure the value is parsed as an integer
    const selectedData = monthlySales.find(
      (sale) => sale.month === selectedMonthIndex + 1
    );
    if (selectedData) {
      setSelectedMonthData({
        revenue: selectedData.total_revenue,
        quantity: selectedData.total_quantity_sold,
      });
    }
  };

  // select month logs
 const handleMonthLog = (event) => {
  const selectedMonthIndex = parseInt(event.target.value, 10); // Ensure the value is parsed as an integer
  const selectedData = cropLogs.find(
    (log) => log.month === selectedMonthIndex + 1
  );
  if (selectedData) {
    setSelectMonthLogs({
      views: selectedData.views,
      purchases: selectedData.purchases,
    });
  }
};

// select sales trend
const handleSalesTrend = (event) => {
  const selectedMonthIndex = parseInt(event.target.value, 10); // Get the selected month index
  const selectedData = salesTrend.find(
    (trend) => trend.month === selectedMonthIndex + 1
  );

  if (selectedData) {
    setMonthlySalesTrend([
      {
        revenue: selectedData.total_revenue,
      },
    ]);
  }
};
 

  useEffect(() =>{
    fetchFarmerCrops()
  }, [])

useEffect(() => {
  monthly_sales();
  crop_logs()
  sales_trend()
  FarmerPricing()
}, [crop_id]); 

// Automatically set stats if only one month is available in monthlySales
useEffect(() => {
  if (monthlySales.length === 1) {
    const { total_revenue, total_quantity_sold } = monthlySales[0];
    setSelectedMonthData({
      revenue: total_revenue,
      quantity: total_quantity_sold,
    });
  }
}, [monthlySales]);

// Automatically set stats if only one month is available in salesTrend
useEffect(() => {
  if (salesTrend.length === 1) {
    const { total_revenue } = salesTrend[0];
    setMonthlySalesTrend([{ revenue: total_revenue }]);
  }
}, [salesTrend]);

// Automatically set stats if only one month is available in cropLogs
useEffect(() => {
  if (cropLogs.length === 1) {
    const { views, purchases } = cropLogs[0];
    setSelectMonthLogs({
      views: views,
      purchases: purchases,
    });
  }
}, [cropLogs]);


  
  const overallPerformanceConfig = {
    series: [{ name: "Sales",   data:monthlysalesTrend.map((sale) => sale.revenue || 0)}],
    options: {
      chart: { type: "line", height: 150},
      colors: ["#4CAF50"],
      xaxis: { categories: months.map(month => month) },
      dataLabels: { enabled: false },
    },
  };


  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f5fff5"}}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 0",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
          Market Insights
        </Typography>
       
      </Box>

      {/* Crop Categories */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0",
          backgroundColor: "#fff",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {farmerCrops.map((crop) => (
          <Button
            key={crop.id}
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              padding: "10px 20px",
               backgroundColor: crop_id === crop.id ? "var(--background-color)" : "inherit",
               color: crop_id === crop.id ? "white" : "#4CAF50"
            }}
            onClick={() => handleCropChange(crop.id)}
          >
            {crop.crop_name}
          </Button>
        ))}
      </Box>

{/* crop perfomance metrics */}
  <h4 className="text-white p-2 text-center market_insight_header mt-5">Crop Perfomance</h4>
  <div className="row log_row">
  <div className="col-md-4 sm-12">
<h4>Monthly</h4>
<span>{today}</span>
  </div>

  <div className="col-md-4 sm-12 ms-auto">
  <select id="autoSizingSelect" className="form-select" onChange={handleMonthChange}>
    {monthlySales.map(sale =>{
      const {year, month} = sale
      return (
        <>
        <option value={month - 1}>{show_month(month - 1)} {year}</option>
        </>
      )
    })}
  </select>
</div>
</div>

<div className="row crop_perfomance_metrics mt-3">
  <div className="col-md-4 sm-12 revenue">
  <h5>UGX {selectedMonthData.revenue.toLocaleString()}</h5>
  <span>Revenue</span>
  </div>

  <div className="col-md-4 sm-12 Sold_Quantity">
  <h5>{selectedMonthData.quantity}</h5>
  <span>Sold Quantity</span>
  </div>
</div>
{/* end metrics */}
<h4 className="text-white p-2 text-center market_insight_header mt-5">User Interaction Logs</h4>

<div className="row log_row">
  <div className="col-md-4 sm-12">
<h4>Monthly</h4>
<span>{today}</span>
  </div>

  <div className="col-md-4 sm-12 ms-auto">
  <select id="autoSizingSelect" className="form-select" onChange={handleMonthLog}>
    {cropLogs.map(log =>{
      const {year, month} = log
      return (
        <>
        <option value={month - 1}>{show_month(month - 1)} {year}</option>
        </>
      )
    })}

  </select>
</div>
</div>

<div className="row interaction_logs mt-3">
  <div className="col-md-4 sm-12 views">
    <h5>{selectMonthLogs.views}</h5>
    <span>Views</span>
  </div>

  <div className="col-md-4 sm-12 purchases">
    <h5>{selectMonthLogs.purchases}</h5>
    <span>Purchases</span>
  </div>
</div>
{/* end user logs */}

      {/* Market sales metrics */}
      <div className="row mt-5">
        <div className="trend col-md-4 sm-12">
      <h4 className="market_trend_header">Market Trend</h4>
        </div>

      <div className="col-md-4 sm-12 ms-auto">
     <select id="autoSizingSelect" className="form-select" onChange={handleSalesTrend}>
      {salesTrend.map(sale =>{
        const {year, month} = sale
        return (
          <option value={month - 1}>{show_month(month - 1)} {year}</option>
        )
      })}
  </select>
</div>
      </div>
      <Grid container spacing={2} className="mt-3">
        {/* First Row */}
        <Grid item xs={12} md={12} sm={12}>
          <Card sx={{ padding: "15px" }}>
            <CardContent>
            {monthlysalesTrend.length === 0 && (
  <Typography>No sales trend data available for the selected month.</Typography>
)}
              <Typography variant="h6" fontWeight="bold">
                Sales Perfomance Trend
              </Typography>
              <Chart
              className='sm-12'
                options={overallPerformanceConfig.options}
                series={overallPerformanceConfig.series}
                type="line"
                height={300}
              />

              <Typography variant="body2" className="sale_desc">
      {salesPerformance !== null && salesPerformance !== "N/A" ? (
        <>
          <span>{salesPerformance}%</span>
          <p>
            Sales performance is {salesPerformance > 0 ? "better" : "worse"} <br />
            compared to last month.
          </p>
        </>
      ) : (
        <p>Perfomance Metrics Data not available</p>
      )}
    </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* end sales metrics */}

        {/* crop average market Price and farmer pricing*/}
        <div className="row price bg-white mt-4 p-2">
          <div className="col -md-5 sm-12 average_price">
            <h4>Market Average Price</h4>
           <span><span>
  {farmerPricing && farmerPricing.crop === crop_id && farmerPricing.average_price_per_kg
    ? `${farmerPricing.average_price_per_kg} / KG`
    : 'Data Not Available'}
</span></span>
          </div>

          <div className="col-md-6 sm-12 farmer_pricing">
            <h4>Different Farmer Prices</h4>
            <ul>
  {farmerPricing && farmerPricing.crop === crop_id && Array.isArray(farmerPricing.farmer_pricing) && farmerPricing.farmer_pricing.length > 0 ? (
    farmerPricing.farmer_pricing.map((price, index) => {
      const { farmer, price_per_kg } = price;
      return (
        <li key={index}>
          {farmer} (UGX {price_per_kg} / KG)
        </li>
      );
    })
  ) : (
    <span>No pricing data available</span>
  )}
</ul>
          </div>
        </div>
      </Grid>
    </Box>
  );
};

export default Market_Insights;
