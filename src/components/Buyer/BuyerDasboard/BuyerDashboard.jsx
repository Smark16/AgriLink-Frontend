import React, { useContext, useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chart from "react-apexcharts";
import axios from "axios";
import '../../Farmer/Dashboard/Dashboard.css'
import { Link } from "react-router-dom";
import '../BuyerDasboard/buyerdash.css'
import UseHook from "../../CustomHook/UseHook";
import moment from "moment";

const ALL_CROPS_URL = 'http://127.0.0.1:8000/agriLink/all_crops'

function BuyerDashboard() {
  const { userOrders = [] } = UseHook();
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all crops
  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const response = await axios.get(ALL_CROPS_URL);
        const { results } = response.data;
        setAllCrops(results);
        setLoading(false);
      } catch (err) {
        console.log('err', err);
      }
    };
    fetchCrops();
  }, []);

  return (
    <div className="container-fluid pt-2">
      <h4 className='user_dashboard p-2'>Dashboard</h4>

      <div className='row dash_row px-xl-5'>
        {/* Dashboard Stats */}
        <div className="col-lg-9 col-md-12 col-sm-12 pb-1">
          <div className='row dash_stats'>
            <div className="stat_orders col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <i className="bi bi-truck text-success"></i>
                <span><strong>{userOrders?.length}</strong></span>
              </div>
              <h6>Total Orders</h6>
            </div>

            <div className="stat_buyers col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <i className="bi bi-tree-fill text-success"></i>
                <span><strong>UGX 3000</strong></span>
              </div>
              <h6>Total Spent</h6>
            </div>

            <div className="stat_sales col-md-3 col-sm-6 mb-3">
              <div className="img_nums">
                <i className="bi bi-bag-heart-fill text-success"></i>
                <span><strong>{userOrders?.length}</strong></span>
              </div>
              <h6>Total Purchases</h6>
            </div>
          </div>

          {/* Recently Uploaded Products */}
          <div className="dash_recent_crops col-lg-12 col-md-12 mt-4 p-2">
            <div className="row recent_text p-2">
              <h4 className="col-md-5 col-sm-12">Recently Uploaded Products</h4>
              <div className="show_all col-md-4 ms-auto col-sm-12 text-white p-2 text-center">
                <span><Link to='/Buyer/all_farmers' className="text-decoration-none text-white">Show All</Link></span>
                <i className="bi bi-arrow-right"></i>
              </div>
            </div>

            {loading ? (
              <div className='crop_loader'></div>
            ) : (
              <>
                {allCrops?.length === 0 && (
                  <div className="no_crops mt-5 text-center">
                    <h5 className="text-muted">No Products Found</h5>
                    <i className="bi bi-tree-fill text-secondary" style={{ fontSize: "2rem" }}></i>
                  </div>
                )}
                <div className="row crops mt-2">
                  {allCrops.slice(0, 3).map(crop => {
                    const { id, crop_name, image } = crop;
                    return (
                      <div key={id} className="col-md-3 col-sm-6 mb-4">
                        <Card sx={{ maxWidth: 345 }}>
                          <CardMedia
                            component="img"
                            alt={crop_name}
                            height="140"
                            image={image}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div" className="crop_name">
                              {crop_name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Recent Orders */}
          <div className="recent_orders p-2 mt-4">
            <div className="row order_text p-2">
              <h4 className="col-md-4 col-sm-12">Recent Orders</h4>
              <div className="show_all col-md-4 ms-auto col-sm-12 text-white p-2 text-center">
                <span><Link to='/Buyer/orders' className="text-white text-decoration-none">Show All</Link></span>
                <i className="bi bi-arrow-right"></i>
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
                  <div className="table-responsive">
                    <table id="myTable" className="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col"># ORDER ID</th>
                          <th scope="col">District</th>
                          <th scope="col">City</th>
                          <th scope="col">Contact</th>
                          <th scope="col">Status</th>
                          <th scope="col">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.slice(0, 5).map((order) => {
                          const { id, status, created_at } = order;
                          const timeTaken = moment(created_at).fromNow();
                          return (
                            <tr key={id}>
                              <td>{id}</td>
                              <td>{order.address.district}</td>
                              <td>{order.address.city}</td>
                              <td>{order.address.contact}</td>
                              <td>
                                <span className={`p-1 ${status === 'Completed' ? 'success' : status === 'Pending' ? 'bg-warning rounded text-white' : 'bg-danger rounded text-white'}`}>
                                  {status}
                                </span>
                              </td>
                              <td>{timeTaken}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;