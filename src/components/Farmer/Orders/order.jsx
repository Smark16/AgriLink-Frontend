import React, { useState, useEffect, useContext } from "react";
import "../Orders/order.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Tooltip from '@mui/material/Tooltip';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import UseAxios from "../../AxiosInstance/AxiosInstance";
import UseHook from "../../CustomHook/UseHook";
import moment from "moment";

import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"

function Order() {
  const axiosInstance = UseAxios();
  const {FarmerOrders, loading, setFarmerOrders} = UseHook()
  console.log('farmer orders', FarmerOrders)
  const [showModal, setShowModal] = useState(false);
  const [usermadeItems, setUserMadeItems] = useState({});
  const [itemLoading, setItemLoading] = useState(false)
  const [statusLoaders, setStatusLoaders] = useState({});

  const changeStatus = async (id, newStatus) => {
    try {
      setStatusLoaders((prev) => ({ ...prev, [id]: true })); // Set loader for the specific order
      await axiosInstance.patch(
        `https://agrilink-backend-hjzl.onrender.com/agriLink/update_status/${id}`,
        { status: newStatus }
      ).then(res => {
        if (res.status === 202) {
          setStatusLoaders((prev) => ({ ...prev, [id]: false })); // Turn off loader
        }
      });
  
      setFarmerOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error changing order status:", err);
      setStatusLoaders((prev) => ({ ...prev, [id]: false })); // Ensure loader turns off on error
    }
  };

  useEffect(() => {
    if (FarmerOrders.length > 0) {
      const tableId = "#myTable";
  
      // Destroy existing DataTable if it exists
      if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
      }
  
      // Initialize DataTable
      $(() => {
        $(tableId).DataTable({
          destroy: true, // Allow reinitialization
        });
      });
    }
  }, [FarmerOrders]);

  const showOrder = async (id) => {
    setShowModal(true);
    const madeOrdersUrl = `https://agrilink-backend-hjzl.onrender.com/agriLink/single_order/${id}`;
  
    try {
      setItemLoading(true);
      const response = await axios.get(madeOrdersUrl);
      const data = response.data; // This is likely a single order object
      console.log(data)
      setUserMadeItems(data); // Assuming `menu` contains the order items
      setItemLoading(false);
    } catch (err) {
      console.error("Error fetching the order:", err);
      setItemLoading(false); // Ensure loading is set to false even on error
    }
  };

  return (
    <div className="container-fluid pt-5">

      <div className="order-container row px-xl-5">

      <h4 className="user-order p-2">Orders</h4>
      {loading ? (
        <div className="loading-container orders_loader">
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
        <div className="cust_orders bg-white p-2 col-lg-12 table-responsive mb-5">
          <TableContainer component={Paper}>
          <Table id="myTable" className="table table-bordered mb-0" aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell scope="col">ORDER ID</TableCell>
                <TableCell scope="col">Buyer Name</TableCell>
                <TableCell scope="col">District</TableCell>
                <TableCell scope="col">Delivery Option</TableCell>
                <TableCell scope="col">Payment method</TableCell>
                <TableCell scope="col">Payment</TableCell>
                <TableCell scope="col">Contact</TableCell>
                <TableCell scope="col">Status</TableCell>
                <TableCell scope="col">Created At</TableCell>
                <TableCell scope="col">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FarmerOrders.map((order) => {
                const { order_id, buyer_name, status, district, contact, created_at, delivery_Option, payment_method } = order;
                const orderTime = moment(created_at).fromNow()
                return (
                  <TableRow key={order_id}>
                    <TableCell>{order_id}</TableCell>
                    <TableCell>{buyer_name}</TableCell>
                    <TableCell>{district}</TableCell>
                    <TableCell>{delivery_Option}</TableCell>
                    <TableCell>{payment_method}</TableCell>
                    <TableCell>{order.payment?.status}</TableCell>
                    <TableCell>{contact}</TableCell>
                    <TableCell>
                      {statusLoaders[order_id] ? (
                       <div class="orderloader"></div>
                      ) : (<>
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
                      
                      </>)}
                    </TableCell>
                    <TableCell>{orderTime}</TableCell>
                    <TableCell>
                      <div className="actions">
                        {/* Dropdown */}
                        <div className="dropdown ms-4">
                          <button
                            className="btn border dropdown-toggle"
                            type="button"
                            id={`statusDropdown${order_id}`}
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            Status
                          </button>
                          <div 
                            className="dropdown-menu" 
                            aria-labelledby={`statusDropdown${order_id}`}
                          >
                            <button 
                              className="dropdown-item" 
                              onClick={() => changeStatus(order_id, "Cancelled")}
                            >
                              Cancelled
                            </button>
                            <button 
                              className="dropdown-item" 
                              onClick={() => changeStatus(order_id, "Completed")}
                            >
                              Completed
                            </button>
                            <button 
                              className="dropdown-item" 
                              onClick={() => changeStatus(order_id, "Pending")}
                            >
                              Pending
                            </button>
                          </div>
                        </div>
                        {/* End Dropdown */}
                            <Tooltip title="View" arrow>
                            <RemoveRedEyeIcon onClick={() => showOrder(order_id)}/>
                        {/* <i className="bi bi-eye text-success" onClick={() => showOrder(order_id)}></i> */}
                            </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </TableContainer>
          
        </div>
      )}

{/* show modal */}
{showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header detail-head">
              <h5 className="custom-modal-title">Order Summary</h5>
              <span>Created at: {moment(usermadeItems.created_at).fromNow()} </span>
              <button type="button" className="close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
  {itemLoading ? (
    <span className="order_loader"></span>
  ) : (
    usermadeItems.order_detail.map((orderDetail) => {
      return orderDetail.crop.map((crop) => {
        const { id, image, quantity, crop_name, price_per_unit, unit, weights } = crop;
        return (
          <div key={id} className="order-items p-2 mt-2">
            <div className="crop_container">
              <div className="crop_detail">
                <img
                  src={`https://res.cloudinary.com/dnsx36nia/${image}`}
                  alt={crop_name}
                  className="modalImg"
                />
                <div className="moreDetail">
                  <div className="crop_info">
                    <h4>{crop_name}</h4>
                    <h6>{moment(usermadeItems.created_at).fromNow()}</h6>
                  </div>

                  <span>UGX {price_per_unit} / {unit}</span>
                </div>
              </div>

              <div className="crop_quantity">
                <div className="quantity">
                  <h6><strong>Quantity</strong></h6>
                  <p>{quantity} {quantity > 1 ? `${unit}s` : unit}</p>

                   {/* if weights */}
                   {weights.length > 0 ? (<>
                    {weights.map(w =>{
                      const {weight, quantity} = w
                      return (
                        <div className="display-w">
                          <span><strong>{weight}:</strong> {quantity} {quantity > 1 ? 'bags' : 'bag'}</span>
                        </div>
                      )
                    })}
                   </>) : ''}
                </div>

                <div className="total_price p-2">
                <h6><strong>Total Price</strong></h6>
                <span className="p-3">UGX {price_per_unit * quantity}</span>
                </div>
              </div>
            </div>
          </div>
        );
      });
    })
  )}
</div>
          </div>
        </div>
      )}
      </div>
      
    </div>

    
  );
}

export default Order;
