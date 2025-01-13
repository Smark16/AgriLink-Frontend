import React, { useState, useEffect } from 'react';
import '../Sidebar/pages.css';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false); // Close sidebar if screen size increases past mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isMobile) {
      if (!isOpen) {
        document.body.classList.add('overlay');
      } else {
        document.body.classList.remove('overlay');
      }
    }
  };

  // Function to close sidebar when a link is clicked, only on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
      document.body.classList.remove('overlay');
    }
  };

  return (
    <>
      {/* Sidebar Open Button */}
      {!isOpen && (
        <div className="open_sidebar" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </div>
      )}

      {/* Sidebar Container */}
      <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
        {/* Close Button */}
        <div className="btns" onClick={toggleSidebar}>
          <i className="bi bi-x-square p-2"></i>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          <ul>
            <li><Link to='/farmer/dashboard' className='links text-black' onClick={handleLinkClick}>Dashboard</Link></li>
            <li><Link to='/farmer/listings' className='links text-black' onClick={handleLinkClick}>My Listings</Link></li>
            <li><Link to='/farmer/customer_orders' className='links text-black' onClick={handleLinkClick}>Orders</Link></li>
            <li><Link to='/farmer/recommendations' className='links text-black' onClick={handleLinkClick}>Crop Recommendations</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Sidebar;