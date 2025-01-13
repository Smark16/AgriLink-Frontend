import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useMediaQuery,
} from "@mui/material";
import Chart from "react-apexcharts";

const Recommend = () => {
  // Sample data for recommendations
  const recommendations = [
    { crop: "Tomatoes", confidence: "90%", demand: "High", buyers: 15 },
    { crop: "Maize", confidence: "85%", demand: "Moderate", buyers: 10 },
    { crop: "Beans", confidence: "80%", demand: "Low", buyers: 5 },
  ];

  // Demand chart configuration
  const demandChartConfig = {
    series: [{ data: [70, 50, 30] }],
    options: {
      chart: { type: "bar", height: 200 },
      xaxis: { categories: ["Tomatoes", "Maize", "Beans"] },
      colors: ["#4CAF50", "#FF9800", "#03A9F4"],
      dataLabels: { enabled: false },
    },
  };

  // Mobile responsiveness
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#4CAF50",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Crop Recommendations
      </Typography>

      {/* Multilingual Selector */}
      <FormControl fullWidth sx={{ marginBottom: "20px" }}>
        <InputLabel>Language</InputLabel>
        <Select defaultValue="English">
          <MenuItem value="English">English</MenuItem>
          <MenuItem value="Swahili">Swahili</MenuItem>
          <MenuItem value="Luganda">Luganda</MenuItem>
        </Select>
      </FormControl>

      {/* Recommendations Cards */}
      <Grid container spacing={2}>
        {recommendations.map((rec, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ padding: "10px" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {rec.crop}
                </Typography>
                <Typography variant="body2">Confidence: {rec.confidence}</Typography>
                <Typography variant="body2">Market Demand: {rec.demand}</Typography>
                <Typography variant="body2">
                  Interested Buyers: {rec.buyers}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "10px" }}
                >
                  Learn How to Grow
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ marginTop: "10px" }}
                >
                  Contact Buyers
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Demand Visualization */}
      <Box
        sx={{
          marginTop: "30px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" marginBottom="20px">
          Market Demand Visualization
        </Typography>
        <Chart
          options={demandChartConfig.options}
          series={demandChartConfig.series}
          type="bar"
          height={200}
        />
      </Box>

      {/* Mobile-friendly action section */}
      <Box
        sx={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#e8f5e9",
          borderRadius: "10px",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          Take Action
        </Typography>
        <Typography variant="body2">
          Start planting crops based on the recommendations. Get seeds, learn
          techniques, or find buyers today.
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={{ marginTop: "10px", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

export default Recommend;
