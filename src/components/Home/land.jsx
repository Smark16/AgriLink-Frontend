
import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import {
  Avatar,
  Stack,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Grid,
  Box,
  Tabs,
  Tab,
  Chip,
  TextField,
} from "@mui/material"
import {
  ShoppingBasket,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowRightIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Nature as LeafIcon,
} from "@mui/icons-material"
import { Link } from "react-router-dom"

// We'll use placeholder images until you provide the actual images
import aiDriven from '../images/image_3.jpg'
import testimony from '../images/image_4.jpg'
import farmProduce from '../images/image_2.jpg'
import farmTech from '../images/image_fx.jpg'
import sustain from '../images/sustain.png'

// avatars
import rec1 from '../images/rec_1.png';
import rec2 from '../images/rec_2.png';
import rec3 from '../images/rec_3.png';
import rec4 from '../images/rec_4.png';

import axios from "axios"
const images = {
  avatars: [rec1, rec2, rec3, rec4],
  partners: [
    "/placeholder.svg?height=60&width=120",
    "/placeholder.svg?height=60&width=120",
    "/placeholder.svg?height=60&width=120",
    "/placeholder.svg?height=60&width=120",
    "/placeholder.svg?height=60&width=120",
  ],
};

// Sample market data for the interactive chart
const marketData = {
  weekly: [
    { day: "Mon", price: 2.5 },
    { day: "Tue", price: 2.7 },
    { day: "Wed", price: 2.3 },
    { day: "Thu", price: 2.8 },
    { day: "Fri", price: 3.0 },
    { day: "Sat", price: 3.2 },
    { day: "Sun", price: 2.9 },
  ],
  monthly: [
    { day: "Week 1", price: 2.6 },
    { day: "Week 2", price: 2.8 },
    { day: "Week 3", price: 3.1 },
    { day: "Week 4", price: 2.9 },
  ],
  yearly: [
    { day: "Jan", price: 2.4 },
    { day: "Feb", price: 2.5 },
    { day: "Mar", price: 2.7 },
    { day: "Apr", price: 2.8 },
    { day: "May", price: 3.0 },
    { day: "Jun", price: 3.2 },
    { day: "Jul", price: 3.1 },
    { day: "Aug", price: 2.9 },
    { day: "Sep", price: 2.7 },
    { day: "Oct", price: 2.6 },
    { day: "Nov", price: 2.5 },
    { day: "Dec", price: 2.4 },
  ],
}

// Featured products
const ALL_CROPS_URL = "https://agrilink-backend-hjzl.onrender.com/agriLink/all_crops"

// Custom styles
const styles = {
  heroSection: {
    background: "linear-gradient(to right, #1b5e20, #2e7d32)",
    minHeight: "700px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    overflow: "hidden",
    padding: "4rem 1rem",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${images.hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.2,
    zIndex: 0,
  },
  animatedCircle: {
    position: "absolute",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  badge: {
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    fontWeight: 500,
    marginBottom: "1rem",
  },
  statCard: {
    backgroundColor: "#e8f5e9",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    transition: "all 0.7s ease",
  },
  chartBar: {
    backgroundColor: "#4caf50",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    transition: "all 0.7s ease-out",
  },
  featureCard: {
    height: "100%",
    transition: "all 0.7s ease",
  },
  testimonialCard: {
    padding: "1.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  ctaSection: {
    background: "linear-gradient(to right, #1b5e20, #2e7d32)",
    padding: "4rem 1rem",
    color: "white",
  },
  footer: {
    backgroundColor: "#1b5e20",
    color: "#e8f5e9",
    padding: "3rem 1rem",
  },
  footerLink: {
    color: "#e8f5e9",
    textDecoration: "none",
    "&:hover": {
      color: "white",
      textDecoration: "underline",
    },
  },
}

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState({
    stats: false,
    features: false,
    products: false,
  })
  const [activeTab, setActiveTab] = useState(0)
  const [count, setCount] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState([])

  const fetchProducts = async()=>{
    try{
     const response = await axios.get(ALL_CROPS_URL)
     const {results} = response.data
     console.log('all crops', results)
     setFeaturedProducts(results)
    }catch(err){
      console.log('err', err)
    }
  }

  useEffect(()=>{
    fetchProducts()
  }, [])
  // Animation for counting up stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (count < 500) {
        setCount((prev) => Math.min(prev + 25, 500))
      } else {
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [count])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "stats-section") {
              setIsVisible((prev) => ({ ...prev, stats: true }))
            } else if (entry.target.id === "features-section") {
              setIsVisible((prev) => ({ ...prev, features: true }))
            } else if (entry.target.id === "products-section") {
              setIsVisible((prev) => ({ ...prev, products: true }))
            }
          }
        })
      },
      { threshold: 0.2 },
    )

    const sections = ["stats-section", "features-section", "products-section"]
    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id)
        if (element) observer.unobserve(element)
      })
    }
  }, [])

  // Function to render the simple chart
  const renderChart = (data) => {
    const maxPrice = Math.max(...data.map((item) => item.price)) * 1.2

    return (
      <Box sx={{ height: "160px", display: "flex", alignItems: "flex-end", gap: "8px" }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              sx={{
                ...styles.chartBar,
                width: "32px",
                height: `${(item.price / maxPrice) * 100}%`,
                opacity: isVisible.stats ? 1 : 0,
                transform: isVisible.stats ? "translateY(0)" : "translateY(20px)",
              }}
            />
            <Typography variant="caption" sx={{ mt: 1 }}>
              {item.day}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white" }}>
      {/* Hero Section with Animated Background */}
      <Box sx={styles.heroSection}>
        <Box sx={styles.heroOverlay} />

        {/* Animated circles in background */}
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <Box
            sx={{
              ...styles.animatedCircle,
              top: "25%",
              left: "25%",
              height: "128px",
              width: "128px",
              backgroundColor: "#66bb6a",
              opacity: 0.2,
            }}
          />
          <Box
            sx={{
              ...styles.animatedCircle,
              top: "75%",
              left: "33%",
              height: "192px",
              width: "192px",
              backgroundColor: "#81c784",
              opacity: 0.1,
              animationDelay: "1s",
            }}
          />
          <Box
            sx={{
              ...styles.animatedCircle,
              top: "33%",
              right: "25%",
              height: "160px",
              width: "160px",
              backgroundColor: "#43a047",
              opacity: 0.15,
              animationDelay: "2s",
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Chip label="Revolutionizing Agriculture" sx={styles.badge} />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 2,
              fontWeight: 800,
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem" },
            }}
          >
            WELCOME TO AGRILINK
          </Typography>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 500 }}>
            Empowering Farmers,
            <br />
            Connecting Buyers With <span style={{ color: "#a5d6a7" }}>AgriLink</span>
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: "#e8f5e9" }}>
            Your Marketplace for Fresh, Direct-from-Farm Produce!
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Link to='/login'>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#388e3c" },
                px: 4,
                py: 1.5,
              }}
            >
              GET STARTED
            </Button>
            
            </Link>
          </Box>
        </Container>

        {/* Scroll indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
          }}
        >
          <ChevronDownIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>

      {/* Stats Section */}
      <Box id="stats-section" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  ...styles.statCard,
                  opacity: isVisible.stats ? 1 : 0,
                  transform: isVisible.stats ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <PeopleIcon sx={{ fontSize: 40, color: "#2e7d32", mb: 2 }} />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700 }}>
                  {isVisible.stats ? count.toLocaleString() : "0"}M+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  ...styles.statCard,
                  opacity: isVisible.stats ? 1 : 0,
                  transform: isVisible.stats ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "0.2s",
                }}
              >
                <LeafIcon sx={{ fontSize: 40, color: "#2e7d32", mb: 2 }} />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700 }}>
                  {isVisible.stats ? "25,000+" : "0"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Farmers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  ...styles.statCard,
                  opacity: isVisible.stats ? 1 : 0,
                  transform: isVisible.stats ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "0.4s",
                }}
              >
                <ShoppingBasket sx={{ fontSize: 40, color: "#2e7d32", mb: 2 }} />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700 }}>
                  {isVisible.stats ? "1.2M+" : "0"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Products
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  ...styles.statCard,
                  opacity: isVisible.stats ? 1 : 0,
                  transform: isVisible.stats ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "0.6s",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 40, color: "#2e7d32", mb: 2 }} />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700 }}>
                  {isVisible.stats ? "40%" : "0%"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Avg. Profit Increase
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
            Connect Directly with Farmers for Fresh Produce
          </Typography>

          {/* Market Insights Section (Enhanced) */}
          <Grid container spacing={4} sx={{ mb: 12, alignItems: "center" }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Chip label="Market Intelligence" sx={styles.badge} />
                <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
                  Real-Time Market Insights – Make Informed Decisions!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: "1.125rem", color: "text.secondary" }}>
                  Stay ahead with up-to-the-minute market data and trends. Access pricing analytics, demand forecasts,
                  and seasonal patterns to optimize your buying and selling strategies.
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: "#2e7d32", mt: 0.5 }} fontSize="small" />
                    <Typography variant="body1">Price comparison across different regions</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: "#2e7d32", mt: 0.5 }} fontSize="small" />
                    <Typography variant="body1">Seasonal trend predictions for better planning</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <CheckCircleIcon sx={{ mr: 1, color: "#2e7d32", mt: 0.5 }} fontSize="small" />
                    <Typography variant="body1">Supply and demand forecasting</Typography>
                  </Box>
                </Box>

                <Button
                  endIcon={<ArrowRightIcon />}
                  sx={{
                    color: "#2e7d32",
                    p: 0,
                    "&:hover .MuiSvgIcon-root": {
                      transform: "translateX(4px)",
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  Explore Insights
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tomato Price Trends
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={activeTab} onChange={handleTabChange} aria-label="market data tabs">
                    <Tab label="Weekly" />
                    <Tab label="Monthly" />
                    <Tab label="Yearly" />
                  </Tabs>
                </Box>
                <TabPanel value={activeTab} index={0}>
                  {renderChart(marketData.weekly)}
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                  {renderChart(marketData.monthly)}
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                  {renderChart(marketData.yearly)}
                </TabPanel>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Average
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                      UGX 2.95/lb
                    </Typography>
                  </Box>
                  <Chip
                    label="↑ 5.2% from last week"
                    variant="outlined"
                    sx={{
                      color: "#2e7d32",
                      borderColor: "#c8e6c9",
                      bgcolor: "#f1f8e9",
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* AI-Driven Section (Enhanced) */}
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
                <Box
                  sx={{
                    position: "relative",
                    paddingTop: "56.25%" /* 16:9 aspect ratio */,
                    bgcolor: "#f5f5f5",
                  }}
                >
                  <img
                    src={aiDriven || "/placeholder.svg?height=400&width=600"}
                    alt="AI-Driven Platform"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, rgba(27,94,32,0.4), transparent)",
                      display: "flex",
                      alignItems: "center",
                      p: 3,
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: 300,
                        bgcolor: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#2e7d32", mb: 1 }}>
                        AI Recommendation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on your location and preferences, we recommend purchasing tomatoes this week before prices
                        increase next month.
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
              <Box>
                <Chip label="Smart Technology" sx={styles.badge} />
                <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
                  Order Smarter, Not Harder,
                  <br />
                  AI-Powered Simplicity at Your Fingertips!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: "1.125rem", color: "text.secondary" }}>
                  Our AI-driven system streamlines ordering, making it as easy as a few taps for quick, hassle-free
                  purchases. Get personalized recommendations based on your preferences, purchase history, and market
                  conditions.
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f1f8e9",
                        border: "1px solid #c8e6c9",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#2e7d32" }}>
                        Personalized
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tailored recommendations based on your preferences
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f1f8e9",
                        border: "1px solid #c8e6c9",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#2e7d32" }}>
                        Predictive
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Anticipates market changes before they happen
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
                <Button
                  endIcon={<ArrowRightIcon />}
                  sx={{
                    color: "#2e7d32",
                    p: 0,
                    "&:hover .MuiSvgIcon-root": {
                      transform: "translateX(4px)",
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section (New) */}
      <Box id="products-section" sx={{ bgcolor: "#f1f8e9", py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip label="Fresh Picks" sx={styles.badge} />
            <Typography variant="h3" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
              Featured Products
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Discover the freshest seasonal produce directly from local farms
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {featuredProducts.slice(0,4).map((product, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    transition: "all 0.5s",
                    opacity: isVisible.products ? 1 : 0,
                    transform: isVisible.products ? "translateY(0)" : "translateY(20px)",
                    transitionDelay: `${index * 0.1}s`,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={`https://res.cloudinary.com/dnsx36nia/${product.image}`}
                    alt={product.crop_name}
                  />
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {product.crop_name}
                        </Typography>
                          </Box>
                      <Chip label={`UGX ${product.price_per_unit}`} size="small" />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        In Season
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 5, textAlign: "center" }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2e7d32",
                "&:hover": { bgcolor: "#1b5e20" },
                px: 4,
                py: 1,
              }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section (New) */}
      <Box id="features-section" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip label="Why Choose AgriLink" sx={styles.badge} />
            <Typography variant="h3" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
              Transforming Agricultural Commerce
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Our platform bridges the gap between farmers and consumers, creating a sustainable ecosystem
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  ...styles.featureCard,
                  opacity: isVisible.features ? 1 : 0,
                  transform: isVisible.features ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 200 }}
                  image={farmProduce || "/placeholder.svg?height=300&width=400"}
                  alt="Direct Farm-to-Table"
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    Direct Farm-to-Table
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Eliminate middlemen and connect directly with farmers. Get fresher produce at better prices while
                    ensuring farmers receive fair compensation for their hard work.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  ...styles.featureCard,
                  opacity: isVisible.features ? 1 : 0,
                  transform: isVisible.features ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "0.2s",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 200 }}
                  image={farmTech || "/placeholder.svg?height=300&width=400"}
                  alt="Advanced Technology"
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    Advanced Technology
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our platform leverages AI, machine learning, and data analytics to optimize the agricultural supply
                    chain, providing insights and efficiencies previously unavailable.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  ...styles.featureCard,
                  opacity: isVisible.features ? 1 : 0,
                  transform: isVisible.features ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "0.4s",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 200 }}
                  image={sustain || "/placeholder.svg?height=300&width=400"}
                  alt="Sustainability Focus"
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    Sustainability Focus
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Support sustainable farming practices and reduce food miles. Our platform promotes environmentally
                    responsible agriculture and shorter supply chains.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section (Enhanced) */}
      <Box sx={{ bgcolor: "#f5f5f5", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 4 }}>
                <Chip label="Testimonials" sx={styles.badge} />
                <Typography variant="h3" component="h2" sx={{ mb: 1, fontWeight: 700 }}>
                  Real Stories, Real Impact
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  What Our Users Are Saying
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={styles.testimonialCard}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>JK</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          James K.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Satisfied Buyer
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      "AgriLink has completely transformed how I buy fresh produce. The direct connection to farmers is
                      fantastic, and with the AI recommendations, I always get exactly what I'm looking for in seconds.
                      It's reliable, easy, and I feel great supporting local farmers!"
                    </Typography>
                    <Box sx={{ color: "#ffc107", display: "flex" }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill" style={{ fontSize: "16px" }}></i>
                      ))}
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={styles.testimonialCard}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>SM</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Sarah M.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Small-Scale Farmer
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      "As a farmer, AgriLink has helped me reach more buyers directly and showcase the quality of my
                      produce. The AI insights make pricing and selling so much easier, and the platform's logistics
                      options have taken the hassle out of delivery. This is the future of farming!"
                    </Typography>
                    <Box sx={{ color: "#ffc107", display: "flex" }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill" style={{ fontSize: "16px" }}></i>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 4 }}>
                <Stack direction="row" spacing={-1}>
                  {images.avatars.map((avatar, index) => (
                    <Avatar key={index} src={avatar} alt={`User ${index + 1}`} sx={{ border: "2px solid white" }} />
                  ))}
                </Stack>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Join <br />+{count.toLocaleString()} Million Users
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 400, md: 600 },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                }}
              >
                <img
                  src={testimony || "/placeholder.svg?height=500&width=400"}
                  alt="Happy AgriLink users"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(27,94,32,0.7), transparent)",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Box sx={{ p: 3, color: "white" }}>
                    <Typography variant="h6" sx={{ fontStyle: "italic", fontWeight: 500 }}>
                      "AgriLink has transformed our community's access to fresh food."
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      — Local Food Co-op Director
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partners Section (New) */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ mb: 5, fontWeight: 700, color: "text.secondary" }}
          >
            Trusted by Industry Leaders
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 4, md: 8 },
            }}
          >
            {/* {images.partners.map((partner, index) => (
              <Box
                key={index}
                sx={{
                  filter: "grayscale(100%)",
                  transition: "all 0.3s",
                  "&:hover": { filter: "grayscale(0%)" },
                }}
              >
                <img
                  src={partner || "/placeholder.svg"}
                  alt={`Partner ${index + 1}`}
                  style={{ height: "48px", width: "auto", objectFit: "contain" }}
                />
              </Box>
            ))} */}
          </Box>
        </Container>
      </Box>

      {/* CTA Section (New) */}
      <Box sx={styles.ctaSection}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Ready to Transform Your Agricultural Experience?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: "#e8f5e9", maxWidth: 700, mx: "auto" }}>
            Join thousands of farmers and buyers already benefiting from our platform. Start your journey with AgriLink
            today.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#1b5e20",
                "&:hover": { bgcolor: "#e8f5e9" },
                px: 4,
                py: 1.5,
              }}
            >
              Sign Up as Farmer
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#1b5e20",
                "&:hover": { bgcolor: "#e8f5e9" },
                px: 4,
                py: 1.5,
              }}
            >
              Sign Up as Buyer
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer (Enhanced) */}
      <Box sx={styles.footer}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={5}>
              <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 700, color: "white" }}>
                AgriLink
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: "#a5d6a7", maxWidth: 450 }}>
                Connecting Farmers & Buyers Directly. Our platform revolutionizes agricultural commerce by creating a
                sustainable ecosystem that benefits everyone.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-facebook text-light fs-5"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-twitter text-light fs-5"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-instagram text-light fs-5"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-linkedin text-light fs-5"></i>
                </a>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "white" }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    About Us
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Contact Us
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Help Center
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    FAQs
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Terms & Conditions
                  </a>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "white" }}>
                Resources
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Blog
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Market Reports
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Farming Tips
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Success Stories
                  </a>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <a
                    href="#"
                    style={{
                      color: "#e8f5e9",
                      textDecoration: "none",
                      "&:hover": { color: "white", textDecoration: "underline" },
                    }}
                  >
                    Events
                  </a>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "white" }}>
                Contact
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                  <i className="bi bi-envelope me-2"></i>
                  support@agrilink.com
                </Box>
                <Box component="li" sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                  <i className="bi bi-telephone me-2"></i>
                  +1 123 456 7890
                </Box>
                <Box component="li" sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                  <i className="bi bi-geo-alt me-2"></i>
                  123 AgriTech Park, Farmville, CA 94107
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Subscribe to our newsletter
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <TextField
                    placeholder="Your email"
                    variant="outlined"
                    size="small"
                    sx={{
                      bgcolor: "#1b5e20",
                      borderRadius: "4px 0 0 4px",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                      },
                      "& .MuiInputBase-input": {
                        color: "#e8f5e9",
                        "&::placeholder": { color: "#a5d6a7", opacity: 1 },
                      },
                    }}
                    InputProps={{
                      sx: { borderRadius: "4px 0 0 4px" },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#4caf50",
                      "&:hover": { bgcolor: "#388e3c" },
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    Subscribe
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ borderTop: "1px solid #2e7d32", pt: 3, textAlign: "center" }}>
            <Typography variant="body2">© 2024 AgriLink. All Rights Reserved</Typography>
          </Box>
        </Container>
      </Box>

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-20px) translateX(-50%); }
          60% { transform: translateY(-10px) translateX(-50%); }
        }
      `}</style>
    </Box>
  )
}