"use client"

import { useContext, useEffect, useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Chip from "@mui/material/Chip"
import Rating from "@mui/material/Rating"
import axios from "axios"
import { Link } from "react-router-dom"
import moment from "moment"
import UseHook from "../../CustomHook/UseHook"

// Icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import ForestIcon from "@mui/icons-material/Forest"
import FavoriteIcon from "@mui/icons-material/Favorite"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"

import '../BuyerDasboard/buyerdashboard.css'
import { AuthContext } from "../../Context/AuthContext"

const ALL_CROPS_URL = "https://agrilink-backend-hjzl.onrender.com/agriLink/all_crops"

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

function BuyerDash() {
  const {user} = useContext(AuthContext)
  const { userOrders = [] } = UseHook()
  const [allCrops, setAllCrops] = useState([])
  const [recommendedCrops, setRecommendedCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [userName, setUserName] = useState(null);

  const SINGLE_PROFILE_URL = user ? `https://agrilink-backend-hjzl.onrender.com/agriLink/profile/${user.user_id}` : '';

    useEffect(() => {
      if (user) {
        fetchUserName();
      }
    }, [user]);
  
    const fetchUserName = async () => {
      try {
        const response = await axios.get(SINGLE_PROFILE_URL);
        setUserName(response.data.get_full_name);
      } catch (error) {
        console.error('Failed to fetch user name:', error);
      }
    };
  

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Dairy"]

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Fetch all crops
  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true)
      try {
        const response = await axios.get(ALL_CROPS_URL)
        const { results } = response.data
        setAllCrops(results)

        // Create mock recommended crops with additional data
        if (results && results.length > 0) {
          const mockRecommended = results.map((crop) => ({
            ...crop,
            price: Math.floor(Math.random() * 50000) + 5000, // Random price between 5000 and 55000
            rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
            farmer: {
              name: `Farmer ${Math.floor(Math.random() * 10) + 1}`,
              location: ["Kampala", "Wakiso", "Jinja", "Mbarara", "Gulu"][Math.floor(Math.random() * 5)],
            },
            category: ["Vegetables", "Fruits", "Grains", "Dairy", "Meat"][Math.floor(Math.random() * 5)],
          }))

          setRecommendedCrops(mockRecommended)
        }

        setLoading(false)
      } catch (err) {
        console.log("err", err)
        setLoading(false)
      }
    }
    fetchCrops()
  }, [])

  // Filter recommended crops by category
  const getFilteredCrops = () => {
    if (tabValue === 0) return recommendedCrops
    return recommendedCrops.filter((crop) => crop.category.toLowerCase() === categories[tabValue].toLowerCase())
  }

  const filteredRecommendedCrops = getFilteredCrops()

  return (
    <div className="container-fluid pt-2 bg-white">

      <div className="dash_head p-2">
      <Typography variant="h4" component="div" fontWeight="bold">
      <strong>Buyer Dashboard</strong>
                </Typography>
                <Typography variant="body2">
                Welcome {userName} 👋 !!, Hope you get a good Experience
                </Typography>
      </div>

      <div className="row dash_row px-xl-5">
        {/* Dashboard Stats */}
        <div className="col-lg-12 col-md-12 col-sm-12 pb-1">
          <div className="row dash_stats">
            <div className="stat_orders col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <LocalShippingIcon className="text-success" />
                <span>
                  <strong>{userOrders?.length}</strong>
                </span>
              </div>
              <h6>Total Orders</h6>
            </div>

            <div className="stat_buyers col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <ForestIcon className="text-success" />
                <span>
                  <strong>UGX 3000</strong>
                </span>
              </div>
              <h6>Total Spent</h6>
            </div>

            <div className="stat_sales col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <FavoriteIcon className="text-success" />
                <span>
                  <strong>{userOrders?.length}</strong>
                </span>
              </div>
              <h6>Total Purchases</h6>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="recommendations_section col-lg-12 col-md-12 mt-4 p-2">
            <Card className="recommendation_card">
              <Box
                sx={{
                  p: 2,
                  background: "linear-gradient(to right, #2e7d32, #43a047)",
                  color: "white",
                }}
              >
                <Typography variant="h5" component="div" fontWeight="bold">
                  Recommended For You
                </Typography>
                <Typography variant="body2" sx={{ color: "#e8f5e9" }}>
                  Products you might be interested in based on your preferences
                </Typography>
              </Box>

              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="product categories"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {categories.map((category, index) => (
                      <Tab key={index} label={category} />
                    ))}
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={tabValue}>
                  {loading ? (
                    <div className="crop_loader"></div>
                  ) : filteredRecommendedCrops.length === 0 ? (
                    <div className="no_crops mt-5 text-center">
                      <h5 className="text-muted">No Products Found in this Category</h5>
                      <ForestIcon style={{ fontSize: "2rem" }} className="text-secondary" />
                    </div>
                  ) : (
                    <Grid container spacing={3} className="mt-2">
                      {filteredRecommendedCrops.slice(0, 6).map((crop) => (
                        <Grid item xs={12} sm={6} md={4} key={crop.id}>
                          <Card className="product_card h-100">
                            <Box sx={{ position: "relative" }}>
                              <CardMedia
                                component="img"
                                height="180"
                                image={`https://res.cloudinary.com/dnsx36nia/${crop.image}`}
                                alt={crop.crop_name}
                              />
                              <Chip
                                label="New"
                                color="success"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  fontWeight: "bold",
                                }}
                              />
                            </Box>
                            <CardContent>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                  <Typography gutterBottom variant="h6" component="div" className="crop_name">
                                    {crop.crop_name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {crop.category}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                  UGX {crop.price.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <Rating value={Number.parseFloat(crop.rating)} precision={0.5} readOnly size="small" />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {crop.rating}
                                </Typography>
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                From: {crop.farmer.name} • {crop.farmer.location}
                              </Typography>

                              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                <Button variant="outlined" size="small" startIcon={<ThumbUpIcon />}>
                                  Save
                                </Button>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<ShoppingCartIcon />}
                                >
                                  Add to Cart
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>
              </CardContent>
            </Card>
          </div>

          {/* Recently Uploaded Products */}
          {/* <div className="dash_recent_crops col-lg-12 col-md-12 mt-4 p-2">
            <div className="row recent_text p-2">
              <h4 className="col-md-5 col-sm-12">Recently Uploaded Products</h4>
              <div className="show_all col-md-4 ms-auto col-sm-12 text-white p-2 text-center">
                <span>
                  <Link to="/Buyer/all_farmers" className="text-decoration-none text-white">
                    Show All
                  </Link>
                </span>
                <ArrowRightAltIcon />
              </div>
            </div>

            {loading ? (
              <div className="crop_loader"></div>
            ) : (
              <>
                {allCrops?.length === 0 && (
                  <div className="no_crops mt-5 text-center">
                    <h5 className="text-muted">No Products Found</h5>
                    <ForestIcon style={{ fontSize: "2rem" }} className="text-secondary" />
                  </div>
                )}
                <div className="row crops mt-2">
                  {allCrops.slice(0, 3).map((crop) => {
                    const { id, crop_name, image } = crop
                    return (
                      <div key={id} className="col-md-3 col-sm-6 mb-4">
                        <Card sx={{ maxWidth: 345 }}>
                          <CardMedia
                            component="img"
                            alt={crop_name}
                            height="140"
                            image={`https://res.cloudinary.com/dnsx36nia/${image}`}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div" className="crop_name">
                              {crop_name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div> */}

          {/* Recent Orders */}
          <div className="recent_orders p-2 mt-4">
            <div className="row order_text p-2">
              <h4 className="col-md-4 col-sm-12">Recent Orders</h4>
              <div className="show_all col-md-4 ms-auto col-sm-12 text-white p-2 text-center">
                <span>
                  <Link to="/Buyer/orders" className="text-white text-decoration-none">
                    Show All
                  </Link>
                </span>
                <ArrowRightAltIcon />
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
              ) : userOrders?.length === 0 ? (
                <div className="no-orders-container text-center">
                  <h5 className="text-muted">No Orders Found</h5>
                  <i className="bi bi-box2-heart text-secondary" style={{ fontSize: "2rem" }}></i>
                </div>
              ) : (
                <div className="cust_orders bg-white p-2">
                  <TableContainer component={Paper}>
                    <Table id="myTable" aria-label="orders table">
                      <TableHead>
                        <TableRow>
                          <TableCell># ORDER ID</TableCell>
                          <TableCell>District</TableCell>
                          <TableCell>City</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userOrders.slice(0, 5).map((order) => {
                          const { id, status, created_at } = order
                          const timeTaken = moment(created_at).fromNow()
                          return (
                            <TableRow key={id}>
                              <TableCell>{id}</TableCell>
                              <TableCell>{order.address.district}</TableCell>
                              <TableCell>{order.address.city}</TableCell>
                              <TableCell>{order.address.contact}</TableCell>
                              <TableCell>
                                <Chip
                                  label={status}
                                  color={
                                    status === "Completed" ? "success" : status === "Pending" ? "warning" : "error"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{timeTaken}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerDash

