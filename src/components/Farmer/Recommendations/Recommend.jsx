import React, { useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

export default function Recommend() {
  const [mode, setMode] = useState("light");
  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const [language, setLanguage] = useState("english");
  const [region, setRegion] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // const handleLanguageChange = (event) => {
  //   setLanguage(event.target.value);
  // };

  // const handleRegionChange = (event) => {
  //   setRegion(event.target.value);
  // };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sample data for recommendations
  const recommendations = [
    {
      crop: "Tomatoes",
      confidence: 90,
      demand: "High",
      buyers: 15,
      demandValue: 70,
      profitMargin: "22%",
      growthTime: "3-4 months",
      waterNeeds: "Medium",
      region: "Central",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      crop: "Maize",
      confidence: 85,
      demand: "Moderate",
      buyers: 10,
      demandValue: 50,
      profitMargin: "18%",
      growthTime: "4-5 months",
      waterNeeds: "Low",
      region: "Eastern",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      crop: "Beans",
      confidence: 80,
      demand: "Low",
      buyers: 5,
      demandValue: 30,
      profitMargin: "15%",
      growthTime: "2-3 months",
      waterNeeds: "Low",
      region: "Northern",
      image: "/placeholder.svg?height=100&width=100",
    },
    // {
    //   crop: "Coffee",
    //   confidence: 88,
    //   demand: "Very High",
    //   buyers: 20,
    //   demandValue: 85,
    //   profitMargin: "25%",
    //   growthTime: "3-4 years",
    //   waterNeeds: "Medium",
    //   region: "Central",
    //   image: "/placeholder.svg?height=100&width=100",
    // },
    // {
    //   crop: "Avocado",
    //   confidence: 92,
    //   demand: "High",
    //   buyers: 18,
    //   demandValue: 75,
    //   profitMargin: "30%",
    //   growthTime: "3-5 years",
    //   waterNeeds: "Medium",
    //   region: "Western",
    //   image: "/placeholder.svg?height=100&width=100",
    // },
    // {
    //   crop: "Cassava",
    //   confidence: 82,
    //   demand: "Moderate",
    //   buyers: 8,
    //   demandValue: 45,
    //   profitMargin: "16%",
    //   growthTime: "9-12 months",
    //   waterNeeds: "Low",
    //   region: "Eastern",
    //   image: "/placeholder.svg?height=100&width=100",
    // },
  ];

  // Filter recommendations by region if needed
  const filteredRecommendations =
    region === "all"
      ? recommendations
      : recommendations.filter((rec) => rec.region === region);

  // Chart data
  const chartData = filteredRecommendations.map((rec) => ({
    name: rec.crop,
    value: rec.demandValue,
    buyers: rec.buyers,
  }));

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
                {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="language-select-label">Language</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={language}
                    label="Language"
                    onChange={handleLanguageChange}
                  >
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="swahili">Swahili</MenuItem>
                    <MenuItem value="luganda">Luganda</MenuItem>
                  </Select>
                </FormControl> */}
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
                Smart Product Recommendations
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "rgba(255, 255, 255, 0.9)" }}
              >
                Data-driven insights to help you choose the most profitable products
                for your region and market conditions.
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
                <Typography variant="h6">View Recommendations</Typography>
              </Box>
              {/* <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="region-select-label">Select Region</InputLabel>
                <Select
                  labelId="region-select-label"
                  id="region-select"
                  value={region}
                  label="Select Region"
                  onChange={handleRegionChange}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  <MenuItem value="Central">Central</MenuItem>
                  <MenuItem value="Eastern">Eastern</MenuItem>
                  <MenuItem value="Western">Western</MenuItem>
                  <MenuItem value="Northern">Northern</MenuItem>
                </Select>
              </FormControl> */}
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
              <Tab label="Chart View" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Recommendations Cards */}
              <Grid container spacing={3}>
                {filteredRecommendations.map((rec, index) => (
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
                          {/* <CardMedia
                            component="img"
                            sx={{ width: 64, height: 64, borderRadius: 1 }}
                            image={rec.image || "/placeholder.svg"}
                            alt={rec.crop}
                          /> */}
                          <Box>
                            <Typography variant="h6" component="h3">
                              {rec.crop}
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
                                {rec.region} Region
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
                                {rec.confidence}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={rec.confidence}
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
                                    {rec.demand}
                                  </Typography>
                                  {(rec.demand === "High" ||
                                    rec.demand === "Very High") && (
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
                                    {rec.buyers}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              {/* <Box sx={styles.metricBox}>
                                <Typography variant="caption" color="text.secondary">
                                  Profit Margin
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {rec.profitMargin}
                                </Typography>
                              </Box> */}
                            </Grid>
                            {/* <Grid item xs={6}>
                              <Box sx={styles.metricBox}>
                                <Typography variant="caption" color="text.secondary">
                                  Growth Time
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {rec.growthTime}
                                </Typography>
                              </Box>
                            </Grid> */}
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
                          {/* <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            endIcon={<ArrowForward />}
                          >
                            Learn How to Grow
                          </Button> */}
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
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Demand Visualization */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Market Demand Comparison
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Visual comparison of market demand and interested buyers for
                    recommended Products
                  </Typography>
                  <Box sx={{ height: 400, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Demand Score"
                          fill={theme.palette.primary.main}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="buyers"
                          name="Interested Buyers"
                          fill={theme.palette.secondary.main}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
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
                  {/* <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                    }}
                  >
                    Get Started
                  </Button> */}
                  {/* <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "white",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Talk to an Expert
                  </Button> */}
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
  );
}