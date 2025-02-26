import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../../Context/AuthContext';
import '../FarmerNotifications/notifications.css';

function FarmerNotifications() {
  const { user, setFarmerNotification, notifications, setNotifications,showNotificationPage, setShowNotificationPage } = useContext(AuthContext);
  const encodedUserId = encodeURIComponent(user.user_id);

  const user_notifications = `https://agrilink-backend-hjzl.onrender.com/agriLink/user_notifications/${encodedUserId}`;
  // const [] = useState([]);
  const [openMessageIndex, setOpenMessageIndex] = useState(null);
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios(user_notifications);
      const data = response.data;
      setNotifications(data.notifications);
      setFarmerNotification(data.notifications)
      setLoading(false)
    } catch (err) {
      console.log('err', err);
    }
  };
// console.log(FarmerNotification)
  const updateIsRead = async (id) => {
    try {
      await axios.patch(`https://agrilink-backend-hjzl.onrender.com/agriLink/update_is_read/${id}`, { is_read: true });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.log('Error updating is_read status:', err);
    }
  };

  const handleToggle = (index, id, is_read) => {
    if (!is_read) {
      updateIsRead(id);
    }
    setOpenMessageIndex(index === openMessageIndex ? null : index);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <div className="notifications">
        <div className="notify_header p-2 d-flex">
        <h5>Notifications</h5>
        <button type="button" className="close ms-auto bg-danger text-white" onClick={() => setShowNotificationPage(false)}>
                &times;
              </button>
        </div>
        {notifications.length === 0 ? (
          <h5>You have no notifications</h5>
        ) : (
          <>
          {loading ? (<>
            <div className="loading-container">
          <div className="spinner-border text-primary text-center" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {/* <p className="text-center">Fetching orders, please wait...</p> */}
        </div>
          </>) : (<>
          
            {notifications.map((msg, index) => {
              const { id, message, is_read, timestamp } = msg;
              const relativeTime = moment(timestamp).fromNow();

              return (
                <div
                  className="message"
                  key={index}
                  onClick={() => handleToggle(index, id, is_read)}
                >
                  <div className="icons">
                    <i className={`bi bi-0-circle-fill ${is_read ? 'read' : ''}`}></i>
                    <span className="icon_text">Notification</span>
                    <i className="bi bi-dot"></i>
                    <span className="icon_text">{relativeTime}</span>
                    <i
                      className={`bi bi-chevron-down ${
                        openMessageIndex === index ? 'rotate' : ''
                      }`}
                    ></i>
                  </div>

                  <div className="notify mt-2">
                    <h5 className={`msg_header ${is_read ? 'read' : ''}`}>AgriLink</h5>
                    <span
                      className={`${
                        openMessageIndex === index ? 'show' : 'msg_text'
                      }`}
                    >
                      {message}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
          </>)}
      </div>
    </>
  );
}

export default FarmerNotifications;
