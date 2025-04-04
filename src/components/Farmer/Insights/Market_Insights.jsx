import React, { useContext, useEffect, useState} from "react";
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
import vector_2 from '../../images/Vector_4.svg'
import vector_3 from '../../images/Vector_3.svg'


const Market_Insights = () => {
  const {user, cropLogs, setCropLogs, selectMonthLogs, setSelectMonthLogs, prices, setPrices, monthlySales, setMonthlySales, salesTrend, 
    setSalesTrend,} = useContext(AuthContext)
  
  const encodedUserId = encodeURIComponent(user.user_id);
  
  const farmer_crops_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/farmer/${encodedUserId}`
  
  const [farmerCrops, setFarmerCrops] = useState([])
  const [crop_id, setCrop_id] = useState(null); 
  const [selectedMonthData, setSelectedMonthData] = useState({ revenue: 0, quantity: 0 });
  const [monthlysalesTrend, setMonthlySalesTrend] = useState([{revenue:0}])
  const [salesPerformance, setSalesPerformance] = useState(null);
  const [farmerPricing, setFarmerPricing] = useState({})
  const [cropLoader, setCropLoader] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [selectedSalesTrendMonth, setSelectedSalesTrendMonth] = useState(new Date().getMonth());
  const [priceLoader, setPriceLoader] = useState(false)
  const [trendMonths, setTrendMonths] = useState([])
  const [isMonthSelected, setIsMonthSelected] = useState(false);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [productQty, setProductQty] = useState({})
  const [loggedInFarmerPricing, setLoggedInFarmerPricing] = useState('')
  
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

  // format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString('en-US', { month: 'short' }); // Gets "Feb"
    const day = date.getDate(); // Gets day (e.g., 17)
    return `${month} ${day}`; // Returns "Feb 17"
  };

  // get current month and year
  const getCurrentMonthAndYear = () => {
    const currentDate = new Date();
    return {
      month: currentDate.getMonth() + 1, // Months are 0-indexed in JavaScript
      year: currentDate.getFullYear(),
    };
  };

  const fetchFarmerCrops = async () => {
    setCropLoader(true)
    try {
      const response = await axios(farmer_crops_url);
      const {results} = response.data
      setFarmerCrops(results);
      setCropLoader(false)
      if (results.length > 0) {
        setCrop_id(results[0].id); // Set crop_id once crops are fetched
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  // change crop view
  const handleCropChange = (id) => {
    if (id) {
      setCrop_id(id);
      setShowModal(true)
      setHasNewWebSocketData(false); // Reset flag for new crop
    }
  };

  // monthly sales
  // useEffect(()=>{

  // }, [])
  const monthly_sales = async () => {
    if (crop_id) {
      try {
        const response = await axios(`https://agrilink-backend-hjzl.onrender.com/agriLink/monthly_sales_overview/${crop_id}`);
        const data = response.data;
        setMonthlySales(data || []);

        // single product
        const product = farmerCrops.find(product => product.id === crop_id)
        setProductQty(product)

        setShowModal(false);
        setSelectedMonthData({revenue:0, quantity:0})
      } catch (err) {
        console.log('err', err);
      }
    }
  };

  console.log('monthly sales', monthlySales)
  
   // farmer pricing
   useEffect(()=>{
    const FarmerPricing = async()=>{
      try{
          setPriceLoader(true)
          const response = await axios(`https://agrilink-backend-hjzl.onrender.com/agriLink/crop_market_insights/${crop_id}`)
          const data = response.data
          setFarmerPricing(data)
          setPrices(data?.farmer_pricing || [])

          // logged in farmer pricing
          const pricingObject = data.farmer_pricing.find(pricing => pricing.farmer === user.username)
          setLoggedInFarmerPricing(pricingObject.price_per_unit)

          setPriceLoader(false)
          setShowModal(false)
        }catch(err){
          console.log('err', err)
        }
    }

    if(crop_id){
      FarmerPricing()
    }
  }, [crop_id])


  // Selected month data
  const handleMonthChange = (event) => {
    const selectedMonthIndex = parseInt(event.target.value, 10); // Ensure the value is parsed as an integer
  
    if (monthlySales.length === 0) {
      // If monthlySales is empty, use the current month and year
      const { month, year } = getCurrentMonthAndYear();
      setSelectedMonthData({
        revenue: 0,
        quantity: 0,
      });
    } else {
      // If monthlySales has data, find the selected month and year
      const selectedData = monthlySales.find(
        (sale) => sale.month === selectedMonthIndex + 1
      );
      if (selectedData) {
        setSelectedMonthData({
          revenue: selectedData.total_amount,
          quantity: selectedData.total_quantity,
        });
      }
    }
  };

    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const response = await axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/get_crop_actions/${crop_id}`);
          const data = response.data;
          setCropLogs(data[0]?.monthly_stats || []);
          setShowModal(false);
        } catch (err) {
          console.error('Error fetching initial crop logs:', err);
        }
      };
    
      if (crop_id) {
        fetchInitialData();
      }
    }, [crop_id]);


// monthly logs
const handleMonthLog = (event) => {
  const selectedMonthIndex = parseInt(event.target.value, 10); // Ensure the value is parsed as an integer

  if (cropLogs.length === 0) {
    // If cropLogs is empty, use the current month and year
    const { month, year } = getCurrentMonthAndYear();
    setSelectMonthLogs({
      views: 0,
      purchases: 0,
    });
  } else {
    // If cropLogs has data, find the selected month and year
    const selectedData = cropLogs.find(
      (log) => log.month === selectedMonthIndex + 1
    );
    if (selectedData) {
      setSelectMonthLogs({
        views: selectedData.views,
        purchases: selectedData.purchases,
      });
    }
  }
};

  // Handle month change for sales trend
  const handleSalesTrend = (event) => {
    const selectedMonth = event.target.value;
    setSelectedSalesTrendMonth(selectedMonth);
    setIsMonthSelected(true);
  
    const selectedSalesTrend = salesTrend.find(trend => trend.month === selectedMonth);
  
    if (selectedSalesTrend && selectedSalesTrend.daily_sales) {
      const daily_trends = selectedSalesTrend.daily_sales.map(day => formatDate(day.date));
      const daily_sales = selectedSalesTrend.daily_sales.map(sale => sale.amount || 0); // Ensure amounts are numbers
  
      setChartData({
        series: [
          {
            name: "Sales",
            data: daily_sales,
          },
        ],
        options: {
          ...chartData.options,
          xaxis: {
            ...chartData.options.xaxis,
            categories: daily_trends,
          },
        },
      });
    } else {
      // If no data is found, reset the chart
      setChartData({
        series: [
          {
            name: "Sales",
            data: [],
          },
        ],
        options: {
          ...chartData.options,
          xaxis: {
            ...chartData.options.xaxis,
            categories: [],
          },
        },
      });
    }
  };

  // initialize current trends for current month
  useEffect(() => {
    if (salesTrend.length > 0) {
      const currentMonth = `${show_month(new Date().getMonth())} ${new Date().getFullYear()}`;
      const currentMonthData = salesTrend.find(trend => trend.month === currentMonth);
  
      if (currentMonthData && currentMonthData.daily_sales) {
        const daily_trends = currentMonthData.daily_sales.map(day => formatDate(day.date));
        const daily_sales = currentMonthData.daily_sales.map(sale => sale.amount || 0);
  
        setChartData({
          series: [
            {
              name: "Sales",
              data: daily_sales,
            },
          ],
          options: {
            ...chartData.options,
            xaxis: {
              ...chartData.options.xaxis,
              categories: daily_trends,
            },
          },
        });
      }
    }
  }, [salesTrend]); // Run this effect when salesTrend changes

  
// Calculate sales performance
const calculatePerformance = (data) => {
  // Check if we have at least 2 months of data
  if (data.length < 2) {
    setSalesPerformance("N/A"); // Not enough data for comparison
    console.log("Not enough data for performance calculation");
    return;
  }

  // Get previous month's total sales
  const previousSalesTotal = data[data.length - 2]['daily_sales']
    .map(sale => sale.amount)
    .reduce((sum, total) => sum + total, 0);
  console.log('Previous sales:', previousSalesTotal);

  // Get current month's total sales
  const currentSalesTotal = data[data.length - 1]['daily_sales']
    .map(sale => sale.amount)
    .reduce((sum, total) => sum + total, 0);
  console.log('Current sales:', currentSalesTotal);

  // Calculate performance
  let performance;
  if (data.length <= 1) {
    performance = "N/A"; // Cannot calculate percentage if previous is zero
  } else {
    performance = ((currentSalesTotal - previousSalesTotal) /currentSalesTotal) * 100;
    performance = performance.toFixed(2); // Round to 2 decimal places
  }

  setSalesPerformance(performance);
};
  
   // Fetch sales trend
   const sales_trend = async () => {
    if (crop_id) {
      try {
        const response = await axios(`https://agrilink-backend-hjzl.onrender.com/agriLink/monthly_sales_overview/${crop_id}/${user?.user_id}`);
        const data = response.data;
        setSalesTrend(data.monthly_sales || []);
        setMonthlySalesTrend([{ revenue: 0 }]);

        // get months
        const saleMonths = data.monthly_sales.map(salemonth => salemonth.month)
        setTrendMonths(saleMonths)

        setShowModal(false);
        calculatePerformance(data.monthly_sales);
      } catch (err) {
        console.log('err', err);
      }
    }
  };

  useEffect(() =>{
    fetchFarmerCrops()
  }, [])

useEffect(() => {
  monthly_sales();
  sales_trend()
}, [crop_id]); 


  // Automatically set stats if only one month is available in salesTrend
  useEffect(() => {
    if (salesTrend.length === 0) {
      // If salesTrend is empty, use the current month and year
      const { month, year } = getCurrentMonthAndYear();
      setMonthlySalesTrend([
        {
          revenue: 0,
        },
      ]);
    } else {
      // If salesTrend has data, find the current month and year
      const { month, year } = getCurrentMonthAndYear();
      const currentMonthData = salesTrend.find(
        (trend) => {
          const trendMonth = new Date(trend.month).getMonth() + 1;
          const trendYear = new Date(trend.month).getFullYear();
          return trendMonth === month && trendYear === year;
        }
      );

      if (currentMonthData && currentMonthData.daily_sales) {
        // Set daily trends for the current month
        setDailyTrends(currentMonthData.daily_sales);
        setMonthlySalesTrend(
          currentMonthData.daily_sales.map((day) => ({
            revenue: day.amount || 0,
          }))
        );
      } else {
        // If current month and year are not in salesTrend, set default values
        setMonthlySalesTrend([
          {
            revenue: 0,
          },
        ]);
      }
    }
  }, [salesTrend]);


// Automatically set stats if only one month is available in cropLogs
useEffect(() => {
  if (cropLogs.length === 0) {
    // If cropLogs is empty, use the current month and year
    const { month, year } = getCurrentMonthAndYear();
    setSelectMonthLogs({
      views: 0,
      purchases: 0,
    });
  } else {
    // If cropLogs has data, find the current month and year
    const { month, year } = getCurrentMonthAndYear();
    const currentMonthData = cropLogs.find(
      (log) => log.month === month && log.year === year
    );
    if (currentMonthData) {
      setSelectMonthLogs({
        views: currentMonthData.views,
        purchases: currentMonthData.purchases,
      });
    } else {
      // If current month and year are not in cropLogs, set default values
      setSelectMonthLogs({
        views: 0,
        purchases: 0,
      });
    }
  }
}, [cropLogs]);

// Automatically set stats if only one month is available in monthlySales
useEffect(() => {
  if (monthlySales.length === 0) {
    // If monthlySales is empty, use the current month and year
    const { month, year } = getCurrentMonthAndYear();
    setSelectedMonthData({
      revenue: 0,
      quantity: 0,
    });
  } else {
    // If monthlySales has data, find the current month and year
    const { month, year } = getCurrentMonthAndYear();
    const currentMonthData = monthlySales.find(
      (sale) => sale.month === month && sale.year === year
    );

    if (currentMonthData) {
      setSelectedMonthData({
        revenue: currentMonthData.total_amount,
        quantity: currentMonthData.total_quantity,
      });
    } else {
      // If current month and year are not in monthlySales, set default values
      setSelectedMonthData({
        revenue: 0,
        quantity: 0,
      });
    }
  }
}, [monthlySales]);

// Get current month's daily sales
const getCurrentMonthDailySales = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const currentMonthKey = `${currentMonth} ${currentYear}`;

  const currentMonthData = salesTrend.find(
    (sale) => sale.month === currentMonthKey
  );

  if (currentMonthData && currentMonthData.daily_sales) {
    return currentMonthData.daily_sales;
  }
  return [];
};


    // Simplify x-axis labels
    const simplifyXAxisLabels = (dailySales) => {
      if (dailySales.length === 0) return [];
    
      const fullDates = dailySales.map(item => formatDate(item.date)); // ["Feb 21", "Feb 22", ...]
      const currentDateStr = formatDate(new Date()); // "Feb 26" (today)
      const currentDayIndex = dailySales.findIndex(item => formatDate(item.date) === currentDateStr);
    
      // If data is short (≤ 4), show all dates
      if (dailySales.length <= 4) return fullDates;
    
      const simplifiedLabels = [];
      const indices = [];
    
      // First date
      simplifiedLabels.push(fullDates[0]);
      indices.push(0);
    
      // Two middle dates (roughly 1/3 and 2/3 through the data)
      const third = Math.floor(dailySales.length / 3); // e.g., index 2 ("Feb 23")
      const twoThirds = Math.floor((dailySales.length * 2) / 3); // e.g., index 4 ("Feb 25")
      if (third !== 0 && third !== dailySales.length - 1) {
        simplifiedLabels.push(fullDates[third]);
        indices.push(third);
      }
      if (twoThirds !== 0 && twoThirds !== dailySales.length - 1 && twoThirds !== third) {
        simplifiedLabels.push(fullDates[twoThirds]);
        indices.push(twoThirds);
      }
    
      // Current date (if not already included)
      if (currentDayIndex !== -1 && !indices.includes(currentDayIndex)) {
        simplifiedLabels.push(fullDates[currentDayIndex]);
        indices.push(currentDayIndex);
      }
    
      // Ensure at least 4 dates by adding the last date if needed
      if (simplifiedLabels.length < 4 && !indices.includes(dailySales.length - 1)) {
        simplifiedLabels.push(fullDates[dailySales.length - 1]);
        indices.push(dailySales.length - 1);
      }
    
      return indices
        .sort((a, b) => a - b)
        .map(index => fullDates[index]);
    };
    
    // Full x-axis labels for default (large screens) and tooltip
    const getFullXAxisLabels = (dailySales) => {
      return dailySales.map(item => formatDate(item.date)); // ["Feb 21", "Feb 22", ...]
    };
    
  // Chart configuration
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Sales",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 300,
        zoom: {
          enabled: false,
        },
      },
      colors: ["#4CAF50"],
      xaxis: {
        categories: [],
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: '12px',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        x: {
          formatter: function (val, { dataPointIndex, series, seriesIndex, w }) {
            // Get the x-axis categories (formatted dates)
            const categories = w.globals.categoryLabels;
            // Return the corresponding label for the hovered data point
            return categories[dataPointIndex] || val;
          },
        },
        y: {
          formatter: function (val) {
            return `UGX ${val}`; // Format the y-axis value as currency
          },
        },
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            xaxis: {
              categories: [],
              labels: {
                rotate: -45,
                style: {
                  fontSize: '10px',
                },
              },
              tickAmount: 3,
            },
          },
        },
      ],
    },
  });

  return (
    <>
    
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
         className="table-responsive"
      >
        {cropLoader ? (<h6>Fetching Products...</h6>) : (
          farmerCrops.map((crop) => (
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
          ))
        )}
      </Box>

{/* crop perfomance metrics */}
  <h4 className="text-white p-2 text-center market_insight_header mt-5">Product Perfomance</h4>
  <div className="row log_row">
  <div className="col-md-4 sm-12">
<h4>Monthly</h4>
<span>{today}</span>
  </div>

  <div className="col-md-4 sm-12 ms-auto">
  <select id="autoSizingSelect" className="form-select" onChange={handleMonthChange}>
  {/* Always include the current month and year */}
  <option value={new Date().getMonth()}>
    {show_month(new Date().getMonth())} {new Date().getFullYear()}
  </option>

  {/* Include months and years from monthlySales */}
  {monthlySales.map((sale) => {
    const { year, month } = sale;
    return (
      <option key={`${year}-${month}`} value={month - 1}>
        {show_month(new Date().getMonth()) === show_month(month - 1) ? '' : `${show_month(month - 1)} ${year}`}
      </option>
    );
  })}
</select>
</div>
</div>

<div className="row crop_perfomance_metrics mt-3">
  <div className="col-md-4 sm-12 revenue">
  <h5>UGX {selectedMonthData.revenue}</h5>
  <span>Revenue</span>
  </div>

  <div className="col-md-4 sm-12 Sold_Quantity">
  <h5>{selectedMonthData.quantity} {productQty.unit === 'Poultry' ? 'Bird' : productQty.unit === 'Livestock' ? 'Animal' : productQty.unit === 'Produce' ? 'Fruit' : productQty.unit}{selectedMonthData.quantity > 1 ? 's' : ''}</h5>
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
  {/* Always include the current month and year */}
  <option value={new Date().getMonth()}>
    {show_month(new Date().getMonth())} {new Date().getFullYear()}
  </option>

  {/* Include months and years from cropLogs */}
  {cropLogs.map((log) => {
    const { year, month } = log;
    return (
      <option key={`${year}-${month}`} value={month - 1}>
        {show_month(new Date().getMonth()) === show_month(month - 1) ? '' : `${show_month(month - 1)} ${year}`}
      </option>
    );
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
      <h4 className="market_trend_header"><strong>Market Trend</strong></h4>
        </div>

      <div className="col-md-4 sm-12 ms-auto">
      <select id="autoSizingSelect" className="form-select" onChange={handleSalesTrend}>
        {/* Always include the current month and year */}
        <option value={`${show_month(new Date().getMonth())} ${new Date().getFullYear()}`}>
          {show_month(new Date().getMonth())} {new Date().getFullYear()}
        </option>

        {/* Include months and years from salesTrend */}
        {trendMonths
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
                className="sm-12"
                options={chartData.options}
                series={chartData.series}
                type="area"
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
                ? `UGX ${farmerPricing.average_price_per_kg.toFixed(2)} `
                : 'Data Not Available'}
            </span></span>

            <div className="keys mt-4 p-2">
              <h6><strong>KEYS</strong></h6>
               
              <span><strong>Down Arrow</strong> <i className="bi bi-arrow-down text-danger animated-bounce"></i>: Product sold at lower price</span>
              <span><strong>Up Arrow</strong> <i className="bi bi-arrow-up text-success animated-bounce"></i>: Product sold at higher price</span>
            </div>
                      </div>

                    <div className="col-md-6 sm-12 farmer_pricing">
                        <h4 className="text-white p-2 text-center">Different Farmer Prices</h4>
                        <ul>
                          {priceLoader ? (
                            <h6>Loading...</h6>
                          ) : (
                            <>
                              {prices.length > 0 ? (
                                prices
                                  .filter((farm) => farm.farmer !== user.username)
                                  .map((price, index) => {
                                    const { price_per_unit, unit, farm_Name, Location } = price;
                                    return (
                                      <li key={index} className="d-block price_lists">
                                        <span>
                                          <strong>{farm_Name}</strong> 
                                          {price_per_unit > loggedInFarmerPricing ? (<img src={vector_3} alt="Vector" />) : (<img src={vector_2} alt="Vector" />)} 
                                          UGX {price_per_unit} / {unit === 'Poultry' ? 'Bird' : unit === 'Livestock' ? 'Animal' : unit === 'Produce' ? 'Fruit' : unit} 
                                          {price_per_unit > loggedInFarmerPricing ? (<i className="bi bi-arrow-up text-success animated-bounce"></i>) : (<i className="bi bi-arrow-down text-danger animated-bounce"></i>)}
                                        </span>
                                        <br />
                                        <span>{Location} District</span>
                                      </li>
                                    );
                                  })
                              ) : (
                              prices.length === 0 && (<span>No Price data available</span>)
                              )}
                            </>
                          )}
                        </ul>
                      </div>
        </div>
      </Grid>
    </Box>

      {/* Custom Modal */}
       {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
            </div>
            <div className="custom-modal-body p-2 justify-content-center d-flex">
            <div className="status_loader"></div>
            <h6>Changing Crop View.....</h6>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Market_Insights;
