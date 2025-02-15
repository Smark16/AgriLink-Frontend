import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../ProductListing/productListing.css'
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const discounts_url = "https://agrilink-backend-hjzl.onrender.com/agriLink/all_discounts";

function ProductListing() {
  const { id } = useParams();
  const {user, cropLogs,  setCropLogs, handleViewLog} = useContext(AuthContext)

  // websockets
  const socketRef = useRef(null)

  const FarmerCropsUrl = `https://agrilink-backend-hjzl.onrender.com/agriLink/farmer/${encodeURIComponent(id)}`;

  const [crops, setCrops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [discounts, setDiscounts] = useState([]);

  const Fetch_Farmer_crops = async () => {
    try {
      setLoader(true);
      const response = await axios.get(FarmerCropsUrl);
      const { results, next, previous, count } = response.data;
      setCrops(results.crops);
      setFilteredCrops(results.crops);
      setPagination({ next, previous, count });
    } catch (err) {
      console.error("Error fetching farmer crops:", err);
    } finally {
      setLoader(false);
    }
  };

  const handlePageChange = async (url, direction) => {
    if (!url) return;
    try {
      setLoader(true);
      const response = await axios.get(url);
      const { results, next, previous, count } = response.data;
      setCrops(results.crops);
      setFilteredCrops(results.crops);
      setPagination({ next, previous, count });
      setCurrentPage((prevPage) => direction === "next" ? prevPage + 1 : prevPage - 1);
    } catch (err) {
      console.error("Error fetching paginated data:", err);
    } finally {
      setLoader(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(discounts_url);
      setDiscounts(response.data);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  };

  useEffect(() => {
    Fetch_Farmer_crops();
    fetchDiscounts();
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
    setFilteredCrops(crops.filter(crop => crop.crop_name.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const handleRatings = () => {
    const sortedCrops = [...filteredCrops].sort((a, b) => b.get_average_rating - a.get_average_rating);
    setFilteredCrops(sortedCrops);
  };

  const handleLatest = () => {
    const sortedDates = [...filteredCrops].sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
    setFilteredCrops(sortedDates);
  };

  const handleAlphabet = () => {
    const sortedAlphabet = [...filteredCrops].sort((a, b) => a.crop_name.localeCompare(b.crop_name));
    setFilteredCrops(sortedAlphabet);
  };

  const renderStars = (averageRating) => {
    const stars = [];
    const ratedStars = Math.round(averageRating || 0);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <i key={i} className={`bi ${i < ratedStars ? 'bi-star-fill' : 'bi-star'}`} />
      );
    }

    return stars;
  };

  const isSoldOut = (crop) => {
    if (crop.weight && crop.weight.length > 0) {
      return crop.weight.reduce((sum, weight) => sum + weight.available, 0) <= 0;
    } else {
      return crop.availability <= 0;
    }
  };

  console.log(cropLogs)
  
  return (
    <div className="container-fluid">
      <div className="row px-xl-5 list_row">
        <div className="col-lg-8 col-md-12 col-sm-12 pb-1">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <form>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                  value={search}
                  onChange={handleChange}
                />
                <div className="input-group-append">
                  <span className="input-group-text bg-transparent text-primary">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>
            </form>
            <div className="dropdown ms-4">
              <button
                className="btn border dropdown-toggle"
                type="button"
                id="sortDropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Sort by
              </button>
              <div className="dropdown-menu dropdown-menu-right" aria-labelledby="sortDropdown">
                <button className="dropdown-item" onClick={handleLatest}>Latest</button>
                <button className="dropdown-item" onClick={handleRatings}>Best Rating</button>
                <button className="dropdown-item" onClick={handleAlphabet}>A-Z</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9 col-sm-12 pb-1">
          {filteredCrops.length === 0 && (
            <div className="no_crops mt-5 text-center">
              <h5 className="text-muted">No Products Available</h5>
              <i className="bi bi-tree-fill text-secondary" style={{ fontSize: '2rem' }}></i>
            </div>
          )}

          {loader ? (
             <div className="list_loader"></div>
          ) : (
            <div className="row">
              {filteredCrops.map(product => {
                const { id, crop_name, image, price_per_unit, description, get_average_rating, get_discounted_price } = product;
                const get_discount = discounts.find(discount => discount.crop === id);

                return (
                  <div key={id} className="col-lg-4 col-md-4 col-sm-6 pb-1">
                    <div className={`card product-item border-0 mb-4 ${isSoldOut(product) ? 'soldout' : ''}`}>
                      <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                        <img className="img-fluid w-100" src={`https://agrilink-backend-hjzl.onrender.com${image}`} alt={crop_name} />
                      </div>
                      <div className="card-body border-left border-right p-2 pt-4 pb-3">
                        <div className="head_rating d-flex">
                          <h6 className="text-truncate truncate-name mb-3">{crop_name}</h6>
                          <div className="farmer_product_rating mr-2">
                            {renderStars(get_average_rating)}
                          </div>
                        </div>
                        <h6 className='desc'>{description}</h6>
                        <div className="d-flex muted_price">
                          <h6 className={`${get_discounted_price > 0 ? 'text-muted ml-2' : ''}`}>
                            {get_discounted_price > 0 ? (<del>UGX {price_per_unit} / kg</del>) : `UGX ${price_per_unit}`}
                          </h6>
                          <h6 className={`${get_discounted_price > 0 ? 'ml-2' : ''}`}>
                            {get_discounted_price > 0 && `UGX ${get_discounted_price} / kg`}
                          </h6>
                        </div>
                        <div className="show-available d-flex">
                          <span className={`${isSoldOut(product) ? 'text-danger' : 'text-warning'}`}>
                            {product.availability > 0 ? product.availability : 0} 
                            {product.weight?.length ? 'bags/sacks' : `${product.unit}${product.InitialAvailability > 1 ? 's' : ''}`}
                          </span>
                          <div className="outer">
                            <div 
                              className="inner" 
                              style={{ 
                                width: `${product.InitialAvailability > 0 ? (product.availability > 0 ? Math.floor((product.availability / product.InitialAvailability) * 100) : 0) : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer d-flex justify-content-between bg-light border">
                        {!isSoldOut(product) ? (
                          <>
                            <Link to={`/Buyer/product_detail/${id}`} className="btn btn-sm text-dark view_cart p-2" onClick={()=> handleViewLog(id)}>
                              <i className="bi bi-eye-fill text-success mr-1" />
                              <span>View Detail</span>
                            </Link>
                            <a className="btn text-dark p-2 add_cart">
                              <i className="bi bi-arrow-down animated-bounce mr-1"></i>
                              <span>
                                {get_discount && get_discount.discount_percent ? `${get_discount.discount_percent} %` : 'No Discount'}
                              </span>
                            </a>
                          </>
                        ) : (
                          <button className="btn btn-danger btn-sm p-2 w-100" disabled>
                            <i className="bi bi-x-circle-fill mr-1"></i> Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-12 pb-1">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-3">
              <li className={`page-item ${!pagination.previous ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  aria-label="Previous"
                  onClick={() => handlePageChange(pagination.previous, 'previous')}
                  disabled={!pagination.previous}
                >
                  <span aria-hidden="true">«</span>
                  <span className="sr-only">Previous</span>
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link">{currentPage}</span>
              </li>
              <li className={`page-item ${!pagination.next ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  aria-label="Next"
                  onClick={() => handlePageChange(pagination.next, 'next')}
                  disabled={!pagination.next}
                >
                  <span aria-hidden="true">»</span>
                  <span className="sr-only">Next</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default ProductListing;