import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import '../Product_Detail/productDetail.css'
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Context/AuthContext';
import Review from './Review';
import Weights from './Weights';
import { Link } from 'react-router-dom';

function ProductDetail() {
  const {id} = useParams()
  const { handleCart, addedItem, quantity, setQuantity, incrementQuantity, decrementQuantity} = useContext(AuthContext);

  const PRODUCT_DETAIL_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/crop_detail/${id}`
  const [Product, setProduct] = useState({})
  const [detailLoader, setDetailLoader] = useState(false)

  const fetchDetail = async()=>{
    setDetailLoader(true)
    try{
      const response = await axios.get(PRODUCT_DETAIL_URL)
      const data = response.data
      setProduct(data)
      setDetailLoader(false)
    }catch(err){
      console.log('err', err)
    }
  }

  useEffect(()=>{
    fetchDetail()
  }, [])

  const isAdded = addedItem.find((item) => item.id === Product.id);
  const currentQuantity = isAdded ? isAdded.quantity : 1;

  useEffect(() => {
    if (Product.weight && Product.weight.length > 0) {
      // Here, 'quantity' refers to the sum of weights' quantities
      const totalQuantityFromWeights = Product.weight.reduce((sum, w) => sum + w.quantity, 0);
      setQuantity(totalQuantityFromWeights);
    } else {
      setQuantity(currentQuantity);
    }
  }, [Product.id, addedItem, Product.weight]);

  const handleAddCart = (item) => {
    if (item.weight && item.weight.length > 0) {
      // Show weights modal instead of directly adding to cart
      setShowWeightModal(true);
    } else {
      handleCart(item);
      showSuccessAlert("Item added to cart");
    }
  };


  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "success",
      timer: 6000,
      toast: true,
      position: 'top',
    })
  };

// rated stars
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

// SOLD OUT
const isSoldOut = (crop) => {
  if (crop.weight && crop.weight.length > 0) {
    // If there are weights, sum up all available quantities
    return crop.weight.reduce((sum, weight) => sum + weight.available, 0) <= 0;
  } else {
    // If there are no weights, just check the availability
    return crop.availability <= 0;
  }
};

  return (
    <>
    <>
  {/* Shop Detail Start */}
  <div className="container-fluid py-5">

    {detailLoader ? (<div className='list_loader'></div>) : (<>
    <div className="row px-xl-5">
        {/* image */}
      <div className="col-lg-5 pb-5">
      <img
                className="w-100 h-100"
                src={`https://res.cloudinary.com/dnsx36nia/${Product.image}`}
                alt="Image"
              />
              
      </div>
      <div className="col-lg-7 pb-5">
        <h3 className="font-weight-semi-bold">{Product.crop_name}</h3>
        <div className="d-flex mb-3 g-2">
          <div className="mr-2 strs">
          {renderStars(Product.get_average_rating)}
          </div>
        <small className="pt-1">({Product.crop_review?.length} Reviews)</small>
        </div>
        <h3 className="font-weight-semi-bold mb-4">UGX {Product.price_per_unit}/ {Product.unit === 'Poultry' ? 'Bird' : Product.unit === 'Livestock' ? 'Animal' : Product.unit === 'Produce' ? 'Fruit' : Product.unit}</h3>
        <p className="mb-4 crop_desc">
         {Product.description}
        </p>

        {/* availability */}
        <div className="show-available d-flex">
      <span className={`${isSoldOut(Product) ? 'text-danger' : 'text-success'}`}>
  {Product.availability > 0 
    ? Product.availability  // Show remaining availability correctly
    : 0 // Keeps it at 0 instead of going back to InitialAvailability
  } 
  {Product.weight?.length 
    ? 'bags/sacks' 
    : `${Product.unit === 'Poultry' ? 'Bird' : Product.unit === 'Livestock' ? 'Animal' : Product.unit === 'Produce' ? 'Fruit' : Product.unit}${Product.InitialAvailability > 1 ? 's' : ''}`}
</span>
<div className="outer">
  <div 
    className="inner" 
    style={{ 
      width: `${
        Product.InitialAvailability > 0 
          ? Product.availability > 0 
            ? Math.floor((Product.availability / Product.InitialAvailability) * 100) 
            : 0 // Ensures that when availability is 0, percentage remains 0%
          : 0
      }%` 
    }}
  >
  </div>
</div>

      </div>

        {/* weights */}
        {Product.weight?.length ? (<Weights product={Product}/>) : (

       <div className="d-flex align-items-center mb-4 pt-2 cart-symbols">
  {isAdded ? (
    <>
      <div className="input-group quantity mr-3" style={{ width: 180 }}>
        <div className="input-group-btn">
          <button
            className="btn btn-success btn-minus"
            onClick={() => decrementQuantity(Product)}
            disabled={quantity === 1}
          >
            <i className="bi bi-dash"></i>
          </button>
        </div>
        <input
          type="text"
          className="form-control bg-secondary text-center w-80"
          value={quantity}
          readOnly
        />
        <div className="input-group-btn">
          <button
            className="btn btn-success btn-plus"
            onClick={() => incrementQuantity(Product)}
            disabled={
              quantity === Product.availability
            }
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>
      <button className="btn btn-dark">
        <i className="bi bi-cart-check-fill mr-1"></i> Added To Cart
      </button>
    </>
  ) : (
    
      <button
        className="btn btn-success"
        onClick={() => handleAddCart(Product)}
      >
        <i className="bi bi-cart-fill mr-1"></i> Add To Cart
      </button>
  )}
</div>
        ) }
       {/* end weights */}


        {/* share */}
        <div className="d-flex pt-2">
          <p className="text-dark font-weight-medium mb-0 mr-2">Share on:</p>
          <div className="d-inline-flex">
            <a className="text-dark px-2" href="">
            <i class="bi bi-facebook"></i>
            </a>
            <a className="text-dark px-2" href="">
            <i class="bi bi-twitter-x"></i>
            </a>
          </div>
        </div>
        
        <Link to={`/Buyer/farmer_product_listing/${Product.user}`}>
        <span>Back to Products</span>
        </Link>
      </div>
    </div>
 
 {/* reviews */}
 <Review product={Product}/>
    
    </>)}
  </div>
  {/* Shop Detail End */}
  {/* Products Start */}
  <div className="container-fluid py-5">
    <div className="text-center mb-4">
      <h2 className="section-title px-5">
        {/* <span className="px-2">You May Also Like</span> */}
      </h2>
    </div>
    <div className="row px-xl-5">
      
    </div>
  </div>
</>

    </>
  )
}

export default ProductDetail
