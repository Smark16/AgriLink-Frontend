import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function Detail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const detail_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/crop_detail/${id}`;
  const post_discount_url = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_discount';
  const edit_discount_url = 'https://agrilink-backend-hjzl.onrender.com/agriLink/edit_discount';
  const all_discounts_url = 'https://agrilink-backend-hjzl.onrender.com/agriLink/all_discounts';

  const [cropDetail, setCropDetail] = useState({});
  const [discount, setDiscount] = useState({
    description: '',
    discount_percent: 0,
    crop: '',
    active: false,
  });
  const [loading, setLoading] = useState(false);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [loadDetail, setLoadDetail] = useState(false)

  // Fetch crop details
  const fetchCropDetail = async () => {
    setLoadDetail(true)
    try {
      const response = await axios.get(detail_url);
      setCropDetail(response.data);
      setLoadDetail(false)
    } catch (err) {
      console.error('Error fetching crop details:', err);
    }
  };

  // Fetch all discounts
  const fetchAllDiscounts = async () => {
    try {
      const response = await axios.get(all_discounts_url);
      setAllDiscounts(response.data);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  };

  useEffect(() => {
    fetchCropDetail();
    fetchAllDiscounts();
  }, []);

  // Update current discount based on crop ID
  useEffect(() => {
    const discountForCrop = allDiscounts.find((d) => d.crop === parseInt(id));
    setCurrentDiscount(discountForCrop);
    if (!discountForCrop) setEditMode(false); // Reset edit mode if no discount exists
  }, [id, allDiscounts]);

  // Pre-fill discount form in edit mode
  useEffect(() => {
    if (editMode && currentDiscount) {
      setDiscount({
        description: currentDiscount.description,
        discount_percent: currentDiscount.discount_percent,
        crop: id,
        active: currentDiscount.active,
      });
    }
  }, [editMode, currentDiscount, id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      description: discount.description,
      discount_percent: parseFloat(discount.discount_percent),
      active: discount.active,
      crop: id,
    };

    try {
      if (editMode && currentDiscount) {
        await axios.put(`${edit_discount_url}/${currentDiscount.id}`, formData);
        showSuccessAlert('Discount updated successfully');
      } else {
        await axios.post(post_discount_url, formData);
        showSuccessAlert('Discount applied successfully');
      }

      fetchAllDiscounts(); // Refresh discounts
      setEditMode(false);
      setDiscount({ description: '', discount_percent: 0, crop: '', active: false });
    } catch (err) {
      console.error('Error submitting discount:', err);
      showErrorAlert('Error applying discount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete crop
  const handleDelete = async () => {
    try {
      await axios.delete(`https://agrilink-backend-hjzl.onrender.com/agriLink/delete_farmer_crop/${id}`);
      showSuccessAlert('Crop deleted successfully');
      navigate('/farmer/listings');
    } catch (err) {
      console.error('Error deleting crop:', err);
      showErrorAlert('Error deleting crop. Please try again.');
    }
  };

  // Success alert
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: 'success',
      timer: 3000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
    });
  };

  // Error alert
  const showErrorAlert = (message) => {
    Swal.fire({
      title: message,
      icon: 'error',
      timer: 3000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
    });
  };

  // Render stars
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

  //isSoldOut
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
    <div>
      <h4>Product Detail Page</h4>

      {loadDetail ? (<div className='list_loader'></div>) : (
        <>
        <div className="detail_wrapper">
        <div className="row details">
          <div className="crop_image col-md-5 sm-12">
            <img src={cropDetail.image || '/placeholder.jpg'} alt="Crop" />

            <div className="farmer_discount mt-3">
              <h5 className="text-white p-2 bg-success text-center">Discount</h5>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Discount Percentage</label>
                    <input
                      type="number"
                      className="form-control"
                      value={discount.discount_percent}
                      onChange={(e) =>
                        setDiscount({ ...discount, discount_percent: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={discount.description}
                      onChange={(e) =>
                        setDiscount({ ...discount, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Activate Discount</label>
                    <input
                      type="checkbox"
                      checked={discount.active}
                      onChange={(e) =>
                        setDiscount({ ...discount, active: e.target.checked })
                      }
                    />
                  </div>
                  <button className="btn btn-success" type="submit">
                    {loading ? 'Saving...' : 'Save Discount'}
                  </button>
                </form>
              ) : (
                currentDiscount ? (
                  <div>
                    <p>Discount: {currentDiscount.discount_percent}%</p>
                    <p>Description: {currentDiscount.description}</p>
                    <button className="btn btn-success" onClick={() => setEditMode(true)}>
                      Edit Discount
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-success" onClick={() => setEditMode(true)}>
                    Add Discount
                  </button>
                )
              )}
            </div>
          </div>

          <div className="summary col-md-6 sm-12">
            <ul className="summary_ul">
              <li>
                <h5>Rating ({cropDetail.get_average_rating || 0}/5):</h5>
                <div className="strs">{renderStars(cropDetail.get_average_rating)}</div>
              </li>
              <li>
                <h5>Crop Name:</h5>
                <span>{cropDetail.crop_name || 'N/A'}</span>
              </li>
              <li>
                <h5>Price Per {cropDetail.unit}:</h5>
                <span>UGX {cropDetail.price_per_unit || 'N/A'}</span>
              </li>
              {cropDetail.weight?.length ? (
              <li  className='detail_weights'>
                <h5>Weights:</h5>
                {cropDetail.weight?.length ? (
  cropDetail.weight?.map((kg, index) => (
    <span key={index} className='justify-content-center'>
      <strong>{kg.weight}:
        <div className="show-weigth">
          <span>{kg.available} {kg.available > 1 ? 'items' : 'item'}</span>

          <div className="outer">
            <div 
              className="inner" 
              style={{
                width: `${kg.available > 0 ? 
                  Math.floor((kg.available / (kg.available + kg.quantity)) * 100) 
                  : 0}%`
              }}
            />
          </div>
        </div> 
      </strong> 
      {index < cropDetail.weight.length - 1 ? '  ' : ''}
    </span>
  ))
) : (
  <span>N/A</span>
)}
              </li>
              ) : ''}

              <li className='detail_weights'>
                <h5>Quantity Availability:</h5>
                <span className={`${isSoldOut(cropDetail) ? 'text-danger' : 'text-warning'}`}>
  {cropDetail.availability > 0 
    ? cropDetail.availability  // Show remaining availability correctly
    : 0 // Keeps it at 0 instead of going back to InitialAvailability
  } 
  ({cropDetail.weight?.length 
    ? 'bags/sacks' 
    : `${cropDetail.unit}${cropDetail.InitialAvailability > 1 ? 's' : ''}`})
</span>

<div className="outer">
  <div 
    className="inner" 
    style={{ 
      width: `${
        cropDetail.InitialAvailability > 0 
          ? cropDetail.availability > 0 
            ? Math.floor((cropDetail.availability / cropDetail.InitialAvailability) * 100) 
            : 0 // Ensures that when availability is 0, percentage remains 0%
          : 0
      }%` 
    }}
  >
  </div>
</div>
              </li>
              <li>
                <h5>Description:</h5>
                <span className='crop_desc'>{cropDetail.description || 'No description available'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="detail_btns">
          <button className="back">
            <Link to="/farmer/listings" className="text-black text-decoration-none">
              <i className="bi bi-arrow-left-short"></i> Listings
            </Link>
          </button>
          <button className="edit">
            <Link to={`/farmer/edit_crop/${id}`} className="text-white text-decoration-none">
              Edit <i className="bi bi-pen"></i>
            </Link>
          </button>
          <button className="delete" onClick={handleDelete}>
            Delete <i className="bi bi-archive"></i>
          </button>
        </div>
      </div>
        </>
      )}
      
    </div>
  );
}

export default Detail;