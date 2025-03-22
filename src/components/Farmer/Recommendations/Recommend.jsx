import React, { useContext, useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowForward,
  FilterList,
  LocationOn,
  People,
  Spa,
  AutoAwesome,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { motion } from "framer-motion";
// import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,} from "recharts";
import { DataGrid } from '@mui/x-data-grid';

import { AuthContext } from "../../Context/AuthContext";
import axios from 'axios'
import Swal from 'sweetalert2'
import '../Recommendations/recommend.css'

// Create custom theme
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#16a34a", // green-600
        light: "#22c55e", // green-500
        dark: "#15803d", // green-700
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#f59e0b", // amber-500
        light: "#fbbf24", // amber-400
        dark: "#d97706", // amber-600
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "light" ? "#f8fafc" : "#0f172a", // slate-50 or slate-900
        paper: mode === "light" ? "#ffffff" : "#1e293b", // white or slate-800
      },
      text: {
        primary: mode === "light" ? "#334155" : "#e2e8f0", // slate-700 or slate-200
        secondary: mode === "light" ? "#64748b" : "#94a3b8", // slate-500 or slate-400
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0px 2px 4px rgba(0, 0, 0, 0.05)"
                : "0px 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
                  : "0px 4px 8px rgba(0, 0, 0, 0.3)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
    },
  });

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Intializing the end points
const BASE_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/'

export default function Recommend() {
  const {user} = useContext(AuthContext)
  const [mode, setMode] = useState("light");
  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const [region, setRegion] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showModal, setShowModal] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [recommendLoader, setRecommendLoader] = useState(false)
  const [buyers, setBuyers] = useState([])
  const [InterestedBuyers, setInterestedBuyers] = useState([])
  const [buyerAddresses, setBuyerAddresses] = useState({});

    // Add state for selected buyers
    const [selectedBuyerIds, setSelectedBuyerIds] = useState([]);
    const [farmName, setFarmName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isFetchingBuyers, setIsFetchingBuyers] = useState(false); // New loading state

  // end points
  const FARMER_RECOMMENDATIONS = `${BASE_URL}recommendations/farmer/${user?.user_id}/`
  const BUYERS = `${BASE_URL}buyers`
  const SEND_EMAILS = `${BASE_URL}send_emails`

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

// fetch recommendations
const fetchRecommendations = async()=>{
  try{
    setRecommendLoader(true)
    const response = await axios(FARMER_RECOMMENDATIONS)
    const data = response.data
    console.log(data)
    setRecommendations(data)
    setRecommendLoader(false)
  }catch(err){
    console.log('recommend err', err)
    setRecommendLoader(false)
  }
}

// fetch buyers
const fetchBuyers = async()=>{
  try{
   const response = await axios.get(BUYERS)
   const data = response.data
   setBuyers(data)
  }catch(err){
    console.log('err fetching buyers', err)
  }
}
useEffect(()=>{
  fetchRecommendations()
  fetchBuyers()
}, [])

  // get buyers with loading state
  const getBuyers = async (buyer_ids) => {
    setIsFetchingBuyers(true);
    setShowModal(true);
    
    try {
      // Filter buyers
      const filteredBuyers = buyers.filter(buyer => buyer_ids.includes(buyer.id));
      setInterestedBuyers(filteredBuyers);

      // Fetch addresses for all buyers
      const addressPromises = filteredBuyers.map(async (buyer) => {
        const USER_ORDERS = `${BASE_URL}user_orders/${buyer.id}`;
        
        try {
          const response = await axios.get(USER_ORDERS);
          const orders = response.data;
          const activeAddress = orders.find(order => order.address.active === true);
          
          return {
            buyerId: buyer.id,
            activeAddress: activeAddress ? activeAddress.address : null,
            district: activeAddress ? activeAddress.address.district : null
          };
        } catch (err) {
          console.log('Error fetching orders for buyer', buyer.id, err);
          return {
            buyerId: buyer.id,
            activeAddress: null,
            district: null
          };
        }
      });

      // Wait for all address fetches to complete
      const addresses = await Promise.all(addressPromises);
      const addressesMap = addresses.reduce((acc, curr) => {
        acc[curr.buyerId] = { 
          activeAddress: curr.activeAddress, 
          district: curr.district 
        };
        return acc;
      }, {});

      setBuyerAddresses(addressesMap);
    } catch (err) {
      console.error('Error in getBuyers:', err);
    } finally {
      setIsFetchingBuyers(false);
    }
  };

// MUI table 
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'fullName', headerName: 'Full Name', width: 160 }, // Matches get_full_name
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'location', headerName: 'Location', width: 160 },
];

  // Map interestedBuyers to rows
  const rows = InterestedBuyers.map(buyer => ({
    id: buyer.id,
    email: buyer.email,
    fullName: buyer.get_full_name, 
    location: buyerAddresses[buyer.id]?.district || 'Not Available'
  }));

  const paginationModel = { page: 0, pageSize: 5 };

  // Handle row selection
  const handleSelectionChange = (newSelection) => {
    setSelectedBuyerIds(newSelection);
  };

    // Handle email sending
    const handleSendEmails = async (e) => {
      e.preventDefault();
      
      if (selectedBuyerIds.length === 0) {
            Swal.fire({
              title: 'Please select at least one buyer',
              icon: "error",
              timer: 6000,
              toast: true,
              position: 'top',
              timerProgressBar: true,
              showConfirmButton: false,
            });
        return;
      }
  
      if (!farmName || !message) {
        Swal.fire({
          title: 'Please fill in both farm name and message',
          icon: "error",
          timer: 6000,
          toast: true,
          position: 'top',
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
  
      setIsSending(true);
      
      try {
        const emailData = {
          user: selectedBuyerIds,
          farm_name: farmName,
          message: message,
          selected: true
        };
  
        const response = await axios.post(SEND_EMAILS, emailData);
        console.log('Emails sent successfully:', response.data);
        
        // Reset form and selection
        setFarmName('');
        setMessage('');
        setSelectedBuyerIds([]);
        setShowModal(false);
        
        Swal.fire({
          title: 'Emails sent successfully!',
          icon: "success",
          timer: 6000,
          toast: true,
          position: 'top',
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error sending emails:', err);
        Swal.fire({
          title: 'Failed to send emails. Please try again.',
          icon: "error",
          timer: 6000,
          toast: true,
          position: 'top',
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } finally {
        setIsSending(false);
      }
    };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Success stories
  const successStories = [
    {
      name: "Sarah Kimani",
      location: "Central Region",
      crop: "Tomatoes",
      story:
        "I followed the recommendation to grow tomatoes and increased my income by 40% in just one season.",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "John Omondi",
      location: "Western Region",
      crop: "Avocado",
      story:
        "Switching to avocado farming based on the recommendations has transformed my farm into a sustainable business.",
      image: "/placeholder.svg?height=80&width=80",
    },
  ];

  // Custom styles
  const styles = {
    heroSection: {
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(to right, #166534, #16a34a)",
      padding: theme.spacing(8, 2),
      color: "#ffffff",
    },
    heroContent: {
      position: "relative",
      zIndex: 10,
      maxWidth: 700,
    },
    heroBackground: {
      position: "absolute",
      right: -80,
      bottom: 0,
      opacity: 0.1,
    },
    filterSection: {
      marginBottom: theme.spacing(4),
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[1],
    },
    metricBox: {
      backgroundColor:
        theme.palette.mode === "light"
          ? "rgba(0, 0, 0, 0.03)"
          : "rgba(255, 255, 255, 0.05)",
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1),
    },
    ctaSection: {
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(to right, #166534, #16a34a)",
      padding: theme.spacing(4),
      borderRadius: theme.shape.borderRadius,
      color: "#ffffff",
      marginBottom: theme.spacing(4),
    },
    ctaContent: {
      position: "relative",
      zIndex: 10,
      maxWidth: 700,
    },
    ctaBackground: {
      position: "absolute",
      right: -80,
      bottom: 0,
      opacity: 0.1,
    },
    footer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(4, 0),
      backgroundColor:
        theme.palette.mode === "light"
          ? "rgba(0, 0, 0, 0.02)"
          : "rgba(255, 255, 255, 0.02)",
    },
  };

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header with navigation and theme toggle */}
        <AppBar position="sticky" color="default" elevation={1}>
          <Container>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Spa sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  AgriLink
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Box>
            </Box>
          </Container>
        </AppBar>

        {/* Hero section */}
        <Box sx={styles.heroSection}>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.heroContent}
            >
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Smart Buyer Recommendations
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "rgba(255, 255, 255, 0.9)" }}
              >
                Data-driven insights to help you get the most interested Buyers
                for your region and market.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: theme.palette.primary.main,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                }}
              >
                Get Recommendations based on Demand
              </Button>
            </motion.div>
          </Container>
          <Box sx={styles.heroBackground}>
            <svg width="400" height="400" viewBox="0 0 200 200">
              <path
                fill="currentColor"
                d="M42.7,-73.4C55.9,-67.7,67.7,-57.5,75.9,-44.5C84.1,-31.5,88.7,-15.7,88.1,-0.3C87.5,15,81.8,30.1,73.1,43C64.4,55.9,52.7,66.8,39.4,74.1C26,81.4,11,85.2,-3.2,89.9C-17.5,94.5,-35,100,-48.1,95.2C-61.2,90.4,-69.9,75.3,-76.3,60C-82.7,44.7,-86.8,29.2,-88.2,13.5C-89.6,-2.2,-88.3,-18.1,-82.5,-32.1C-76.7,-46.1,-66.4,-58.2,-53.3,-64C-40.2,-69.8,-24.3,-69.3,-9.4,-75.5C5.5,-81.7,29.5,-79.1,42.7,-73.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </Box>
        </Box>

        <Container sx={{ py: 4, flex: 1 }}>
          {/* Filter section */}
          <Paper sx={styles.filterSection}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* <FilterList color="action" /> */}
                <Typography variant="h6">View Buyer Recommendations</Typography>
              </Box>
            </Box>
          </Paper>


          {/* Tabs for different views */}
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ mb: 2 }}
              variant="fullWidth"
            >
              <Tab label="Card View" id="tab-0" aria-controls="tabpanel-0" />
              {/* <Tab label="Chart View" id="tab-1" aria-controls="tabpanel-1" /> */}
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Recommendations Cards */}
               {recommendLoader ? (
                <div>
                <div className="loader"></div>
                <p className='text-center'>Loading data...</p>
              </div>
              ) : (
                recommendations.length === 0 ? (<h6>No Recommendations yet</h6>) : (
                  <>
                   <Grid container spacing={3}>
                {recommendations.map((rec, index) => (
                
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      style={{ height: "100%" }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box>
                            <Typography variant="h6" component="h3">
                              {rec.product_name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocationOn
                                sx={{
                                  fontSize: 12,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                any location
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <CardContent sx={{ pt: 0, pb: 1, flex: 1 }}>
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Confidence Score
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {rec.confidence_score.length > 0 
                              ? rec.confidence_score.reduce((sum, total) => sum + total, 0) 
                              / rec.confidence_score.length 
                              : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value= {rec.confidence_score.length > 0 
                                ? rec.confidence_score.reduce((sum, total) => sum + total, 0) 
                                / rec.confidence_score.length 
                                : 0}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>

                          <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                              <Box sx={styles.metricBox}>
                                <Typography variant="caption" color="text.secondary">
                                  Market Demand
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {rec.market_demand}
                                  </Typography>
                                  {(rec.market_demand === "moderate" ||
                                    rec.market_demand === "high") && (
                                    <Chip
                                      label="Hot"
                                      size="small"
                                      sx={{
                                        ml: 0.5,
                                        height: 20,
                                        bgcolor:
                                          theme.palette.mode === "light"
                                            ? "#dcfce7"
                                            : "#064e3b",
                                        color:
                                          theme.palette.mode === "light"
                                            ? "#166534"
                                            : "#4ade80",
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={styles.metricBox}>
                                <Typography variant="caption" color="text.secondary">
                                  Interested Buyers
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <People sx={{ fontSize: 14, mr: 0.5 }} />
                                  <Typography variant="body2" fontWeight="medium">
                                    {rec.buyer_id?.length}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                            </Grid>
                          </Grid>
                        </CardContent>

                        <CardActions
                          sx={{
                            p: 2,
                            pt: 1,
                            mt: "auto",
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "rgba(0, 0, 0, 0.02)"
                                : "rgba(255, 255, 255, 0.02)",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            endIcon={<ArrowForward />}
                            onClick={()=>getBuyers(rec.buyer_id)}
                          >
                            Contact Buyers
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                            }}
                          >
                            Based on market Demand
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
                  </>
                )
               )}
              
            </TabPanel>
          </Box>

          {/* Success Stories */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <AutoAwesome sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h5">Success Stories</Typography>
            </Box>
            <Grid container spacing={3}>
              {successStories.map((story, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Avatar
                          src={story.image}
                          alt={story.name}
                          sx={{ width: 64, height: 64 }}
                        />
                        <Box>
                          <Typography variant="h6">{story.name}</Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocationOn
                              sx={{
                                fontSize: 12,
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {story.location}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${story.crop} Farmer`}
                            size="small"
                            sx={{ mt: 0.5 }}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        "{story.story}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Box sx={styles.ctaSection}>
              <Box sx={styles.ctaContent}>
                <Typography variant="h4" gutterBottom>
                  Ready to Transform Your Farm?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "rgba(255, 255, 255, 0.9)" }}
                >
                  Get personalized recommendations based on your specific
                  location and available resources. Our AI-powered
                  system analyzes market trends and environmental factors to
                  suggest the most profitable products for your farm.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                 
                </Box>
              </Box>
              <Box sx={styles.ctaBackground}>
                <svg width="400" height="400" viewBox="0 0 200 200">
                  <path
                    fill="currentColor"
                    d="M42.7,-73.4C55.9,-67.7,67.7,-57.5,75.9,-44.5C84.1,-31.5,88.7,-15.7,88.1,-0.3C87.5,15,81.8,30.1,73.1,43C64.4,55.9,52.7,66.8,39.4,74.1C26,81.4,11,85.2,-3.2,89.9C-17.5,94.5,-35,100,-48.1,95.2C-61.2,90.4,-69.9,75.3,-76.3,60C-82.7,44.7,-86.8,29.2,-88.2,13.5C-89.6,-2.2,-88.3,-18.1,-82.5,-32.1C-76.7,-46.1,-66.4,-58.2,-53.3,-64C-40.2,-69.8,-24.3,-69.3,-9.4,-75.5C5.5,-81.7,29.5,-79.1,42.7,-73.4Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </Box>
            </Box>
          </motion.div>
        </Container>

        {/* Footer */}
        <Box sx={styles.footer} component="footer">
          <Container>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "center" : "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Spa sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  AgriLink
                </Typography>
              </Box>
              <Box sx={{ textAlign: isMobile ? "center" : "right" }}>
                <Typography variant="body2" color="text.secondary">
                  © 2025 AgriLink. All rights reserved.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Empowering farmers with data-driven insights
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>

    {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal modal_width">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Contact Interested Buyers</h5>
              <button 
                type="button" 
                className="close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="custom-modal-body p-2 justify-content-center">
              {isFetchingBuyers ? (
                <div className="text-center py-4">
                  <div className="loader"></div>
                  <p>Loading buyer information...</p>
                </div>
              ) : (
                <>
                  <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      initialState={{ pagination: { paginationModel } }}
                      pageSizeOptions={[5, 10]}
                      checkboxSelection
                      onRowSelectionModelChange={handleSelectionChange}
                      rowSelectionModel={selectedBuyerIds}
                      sx={{ border: 0 }}
                    />
                  </Paper>

                  <form 
                    className='mt-2 interest_form p-2 rounded'
                    onSubmit={handleSendEmails}
                  >
                    <h6 className="p-2 int_header">
                      <strong>Send Reminders to selected Buyers</strong>
                    </h6>
                    <div className="mb-3">
                      <label htmlFor="farmName" className="form-label">
                        Farm Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="farmName"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        disabled={isSending}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">
                        Message
                      </label>
                      <textarea
                        className="form-control"
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isSending}
                        rows={4}
                      />
                    </div>

                    <button 
                      className='btn bg-success text-white text-center p-2 mt-2 rounded'
                      type="submit"
                      disabled={isSending}
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
</>
  );
}