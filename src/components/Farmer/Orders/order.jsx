import React, { useState, useEffect, useContext } from "react";
import "../Orders/order.css";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import UseAxios from "../../AxiosInstance/AxiosInstance";
import UseHook from "../CustomHook/UseHook";

function Order() {
  const axiosInstance = UseAxios();
  const {FarmerOrders, loading, setFarmerOrders} = UseHook()
 
  const [showModal, setShowModal] = useState(false);
  const [usermadeItems, setUserMadeItems] = useState({});
  const [itemLoading, setItemLoading] = useState(false)

  

  const changeStatus = async (id, newStatus) => {
    try {
      await axiosInstance.patch(
        `http://127.0.0.1:8000/agriLink/update_status/${id}`,
        { status: newStatus }
      );
      setFarmerOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error changing order status:", err);
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
    const madeOrdersUrl = `http://127.0.0.1:8000/agriLink/single_order/${id}`;
  
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

  // delete order
  const handleDelete = async(id)=>{
   try{
   await axios.delete(`http://127.0.0.1:8000/agriLink/DeleteOrder/${id}`)
   setFarmerOrders((prevOrders) =>prevOrders.filter(order => order.order_id !== id) )
   }catch(err){
    console.log('err', err)
   }
  }

  return (
    <div className="order-container">
      <h4>Orders</h4>
      {loading ? (
        <div className="loading-container">
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
        <div className="cust_orders bg-white p-2">
          <table id="myTable" className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">ORDER ID</th>
                <th scope="col">Buyer Name</th>
                <th scope="col">Shipping Address</th>
                <th scope="col">Payment</th>
                <th scope="col">Contact</th>
                <th scope="col">Status</th>
                <th scope="col">Created At</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {FarmerOrders.map((order) => {
                const { order_id, buyer_name, status, shipping_address, contact, created_at } =
                  order;
                return (
                  <tr key={order_id}>
                    <td>{order_id}</td>
                    <td>{buyer_name}</td>
                    <td>{shipping_address}</td>
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
                    <td>{created_at}</td>
                    <td>
                      <div className="actions">
                        {/* Dropdown */}
                        <div className="dropdown">
                          <span className="status_change">Change Status</span>
                          <div className="dropdown-content">
                            <p onClick={() => changeStatus(order_id, "Cancelled")}>Cancelled</p>
                            <p onClick={() => changeStatus(order_id, "Completed")}>Completed</p>
                            <p onClick={() => changeStatus(order_id, "Pending")}>Pending</p>
                          </div>
                        </div>
                        {/* End Dropdown */}
                        <i className="bi bi-eye text-success" onClick={() => showOrder(order_id)}></i>
                        <i className="bi bi-archive text-danger" onClick={()=> handleDelete(order_id)}></i>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

{/* show modal */}
{showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Order Summary</h5>
              <span>Created at: {usermadeItems.created_at} </span>
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
        const { id, image, quantity, crop_name, price_per_kg } = crop;
        return (
          <div key={id} className="order-items">
            <div className="crop_container">
              <div className="crop_detail">
                <img
                  src={`http://127.0.0.1:8000${image}`}
                  alt={crop_name}
                  className="modalImg"
                />
                <div className="moreDetail">
                  <div className="crop_info">
                    <h4>{crop_name}</h4>
                    <h6>{usermadeItems.created_at}</h6>
                  </div>

                  <span>UGX {price_per_kg} / kg</span>
                </div>
              </div>

              <div className="crop_quantity">
                <div className="quantity">
                  <h6>Quantity</h6>
                  <p>{quantity}</p>
                </div>

                <div className="total_price">
                <h6>Total Price</h6>
                <span className="p-3">UGX {price_per_kg * quantity}</span>
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

    
  );
}

export default Order;
