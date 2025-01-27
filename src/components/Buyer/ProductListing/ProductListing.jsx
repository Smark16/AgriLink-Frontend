import React, { useContext, useEffect, useState } from 'react'
import { useParams,  Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import '../ProductListing/ProductListing.css'
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import Swal from 'sweetalert2';

const discounts_url = "http://127.0.0.1:8000/agriLink/all_discounts"

function ProductListing() {
  const {id} = useParams()
  const {handleCart} = useContext(AuthContext)
  const FarmerCropsUrl = `http://127.0.0.1:8000/agriLink/farmer/${encodeURIComponent(id)}`;

  const [crops, setCrops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState('')
  const [addedItems, setAddedItems] = useState([]);
  const [discounts, setDiscounts] = useState([])
  const [productDiscount, setProductDiscount] = useState('')

  // Fetch farmer products
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
    if (!url) return; // Prevent unnecessary API calls
    try {
      setLoader(true);
      const response = await axios.get(url);
      const { results, next, previous, count } = response.data;
      setCrops(results.crops);
      setFilteredCrops(results.crops);
      setPagination({ next, previous, count });
  
      // Update the current page
      setCurrentPage((prevPage) =>
        direction === "next" ? prevPage + 1 : prevPage - 1
      );
    } catch (err) {
      console.error("Error fetching paginated data:", err);
    } finally {
      setLoader(false);
    }
  };

  // fetch discounts
  const fetchDiscounts = async()=>{
    try{
     const response = await axios.get(discounts_url)
     const data = response.data
     setDiscounts(data)
    }catch(err){
      console.log('err', err)
    }
  }

  useEffect(()=>{
    fetchDiscounts()
  }, [])
  

const handleChange = (e)=>{
   setSearch(e.target.value)
   setFilteredCrops(crops.filter(crop => crop.crop_name.toLowerCase().includes(e.target.value.toLowerCase())))
}

// Sorting functions
const handleRatings = () => {
  const sortedCrops = [...filteredCrops].sort((a, b) => b.get_average_rating - a.get_average_rating);
  setFilteredCrops(sortedCrops);
};

const handleLatest = ()=>{
  const sortedDates = [...filteredCrops].sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
  setFilteredCrops(sortedDates)
}

const handleAlphabet = () => {
  const sortedAlphabet = [...filteredCrops].sort((a, b) => 
    a.crop_name.localeCompare(b.crop_name)
  );
  setFilteredCrops(sortedAlphabet);
};


  useEffect(()=>{
    Fetch_Farmer_crops()
  }, [])

  // rated starts
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

  return (
  <>
  <>
  {/* Shop Product Start */}
  <div className="col-lg-9 col-md-12 buyer_product_listing">
    <div className="row pb-3">
      <div className="col-12 pb-1">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <form action="">
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
                <i class="bi bi-search"></i>
                </span>
              </div>
            </div>
          </form>

          {/* sorting */}
          <div className="dropdown ms-4">
  <button
    className="btn border dropdown-toggle"
    type="button"
    id="triggerId"
    data-bs-toggle="dropdown"
    aria-haspopup="true"
    aria-expanded="false"
  >
    Sort by
  </button>
  <div
    className="dropdown-menu dropdown-menu-right"
    aria-labelledby="triggerId"
  >
    <a className="dropdown-item sorting_anchor" onClick={handleLatest}>Latest</a>
    <a className="dropdown-item sorting_anchor" onClick={handleRatings}>Best Rating</a>
    <a className="dropdown-item sorting_anchor" onClick={handleAlphabet}>A-Z</a>
  </div>
</div>
        </div>
      </div>
      {filteredCrops.length === 0 &&  
          <div className="no_crops mt-5 text-center">
              <h5 className="text-muted">No Products Available</h5>
              <i className="bi bi-tree-fill text-secondary" style={{ fontSize: '2rem' }}></i>
            </div>}
          
        {loader ? (<div className='loader'></div>) : (<>
         {filteredCrops.map(product =>{
          const {id, crop_name, image, price_per_unit, description, get_average_rating, get_discounted_price} = product
          
          const get_discount = discounts.find(discount => discount.crop === id)
          
          return (
            <>
      <div key={id} className="col-lg-4 col-md-6 col-sm-12 pb-1">
        <div className="card product-item border-0 mb-4">
          <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
            <img className="img-fluid w-100" src={`http://127.0.0.1:8000${image}`} alt="" />
          </div>
          <div className="card-body border-left border-right  p-2 pt-4 pb-3">
            <div className="head_rating d-flex">
            <h6 className="text-truncate truncate-name mb-3">{crop_name}</h6>
            <div className="farmer_product_rating mr-2">
           {renderStars(get_average_rating)}
            </div>
            </div>
            <h6>{description}</h6>
            <div className="d-flex muted_price" >
              <h6 className={`${get_discounted_price > 0 ? 'text-muted ml-2' : ''}`}>
                {get_discounted_price > 0 ? (<del>UGX {price_per_unit} / kg</del>) : `UGX ${price_per_unit}`}
                </h6>
              <h6 className={`${get_discounted_price > 0 ? 'ml-2' : ''}`}>
                {get_discounted_price > 0 && `UGX ${get_discounted_price} / kg`}
              </h6>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between bg-light border">
            <Link to={`/Buyer/product_detail/${id}`} className="btn btn-sm text-dark view_cart p-2">
              <i className="bi bi-eye-fill text-success mr-1" />
              <span>View Detail</span>
            </Link>
            <a className="btn text-dark p-2 add_cart">
            <i class="bi bi-arrow-down animated-bounce mr-1"></i>
              <span>
              {get_discount && get_discount.discount_percent ? `${get_discount.discount_percent} %` : 'No Discount'}
                </span>
            </a>
          </div>
        </div>
      </div>
            
            </>
          )
         })}
        </>)}
      
      {/* pagination */}
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
  {/* Shop Product End */}
  {/* Shop End */}
</>

  </>
  )
}

export default ProductListing
