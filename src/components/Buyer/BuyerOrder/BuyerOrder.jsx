import React, { useState} from "react";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import '../BuyerOrder/buyerorder.css'
import image from '../../images/cart_image.png'
import Swal from "sweetalert2";

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import UseHook from "../../CustomHook/UseHook";

import moment from "moment";

function BuyerOrder() {
  const {userOrders, setUserOrders, Orderloading} = UseHook()

  // delete order
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/agriLink/DeleteOrder/${id}`);
      setUserOrders(prevOrders => prevOrders.filter(order => order.id !== id));
         Swal.fire({
              title: 'Order Deleted successfully',
              icon: "error",
              timer: 6000,
              toast: true,
              position: 'top',
              timerProgressBar: true,
              showConfirmButton: false,
            });
    } catch (err) {
      console.log('Error deleting order:', err);
    }
  };

  return (
    <div className="order_wrapper container-fluid pt-5">

      <div className="order-container row px-xl-5">
        <h4 className="user-order p-2">Orders</h4>
        {Orderloading ? (
          <div className="loading-container orders_loader">
            <div className="spinner-border text-primary text-center" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-center">Fetching orders, please wait...</p>
          </div>
        ) : userOrders.length === 0 ? (
          <div className="cart_zero">
            <img src={image} alt='no item' />
            <h5>You don't have any Orders</h5>
            <span className='text-center'>Here you will be able to see all the orders that <br />you carry on</span>
          </div>
        ) : (
          <div className="cust_orders col-lg-12 table-responsive mb-5 bg-white p-2">
            <table id="myTable" className="table table-bordered text-center mb-0">
              <thead className="bg-secondary text-dark">
                <tr>
                  <th scope="col"># ORDER ID</th>
                  <th scope="col">District</th>
                  <th scope="col">City</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Delivery Option</th>
                  <th scope="col">Payment method</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((order) => {
                  // Check if address exists before accessing its properties
                  const district = order.address ? order.address.district : 'N/A';
                  const city = order.address ? order.address.city : 'N/A';
                  const contact = order.address ? order.address.contact : 'N/A';
                  const orderTime = moment(order.created_at).fromNow()
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{district}</td>
                      <td>{city}</td>
                      <td>{contact}</td>
                      <td>{order.delivery_option}</td>
                      <td>{order.payment_method}</td>
                      <td><span className={`p-1 ${order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'bg-warning rounded text-white' : 'bg-danger rounded text-white'}`}>{order.status}</span></td>
                      <td>{orderTime}</td>
                      <td>
                      <Tooltip title="Delete">
                      <IconButton>
                        <DeleteIcon onClick={() => handleDelete(order.id)}/>
                      </IconButton>
                    </Tooltip>
                       
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerOrder;