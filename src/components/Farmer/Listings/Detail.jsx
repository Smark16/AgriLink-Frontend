import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function Detail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const detail_url = `http://127.0.0.1:8000/agriLink/crop_detail/${id}`;

  const [cropDetail, setCropDetail] = useState({}); // Initialize as an object

  // Fetch crop detail
  const fetch_crop_detail = async () => {
    try {
      const response = await axios.get(detail_url);
      const data = response.data;
      console.log(data);
      setCropDetail(data);
    } catch (err) {
      console.error('An error occurred while fetching crop details:', err);
    }
  };

  useEffect(() => {
    fetch_crop_detail();
  }, []);

  // Render stars based on the average rating
  const render_stars = (average_rating) => {
    const stars = [];
    const ratedStars = Math.round(average_rating || 0);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i < ratedStars ? 'bi-star-fill' : 'bi-star'}`}
        />
      );
    }

    return stars;
  };

  // Handle crop deletion
  const handleDelete = async (cropId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/agriLink/delete_farmer_crop/${cropId}`);
      showSuccessAlert('Deleted successfully');
      navigate('/farmer/listings');
    } catch (err) {
        console.log('delete err', err)
      showErrorAlert('Deleting Error. Please try again.');
    }
  };

  // Show error alert
  const showErrorAlert = (message) => {
    Swal.fire({
      title: message,
      icon: 'error',
      timer: 6000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
    });
  };

  // Show success alert
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: 'success',
      timer: 6000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
    });
  };

  return (
    <>
      <h4>Product Detail Page</h4>
      <div className="detail_wrapper">
        <div className="row details">
          <div className="crop_image col-md-5 sm-12">
            <img src={cropDetail.image || '/placeholder.jpg'} alt="crop" />
          </div>

          <div className="summary col-md-6 sm-12">
            <ul className="summary_ul">
              <li>
                <h5>Rating ({cropDetail.get_average_rating || 0}/5):</h5>
                <div className="strs">{render_stars(cropDetail.get_average_rating)}</div>
              </li>

              <li>
                <h5>Crop Name:</h5>
                <span>{cropDetail.crop_name || 'N/A'}</span>
              </li>

              <li>
                <h5>Price Per Kg:</h5>
                <span>UGX {cropDetail.price_per_kg || 'N/A'}</span>
              </li>

              <li>
                <h5>Weights:</h5>
                {cropDetail.weight?.length ? (
                  cropDetail.weight.map((kg, index) => (
                    <span key={index}>
                      {kg}
                      {index < cropDetail.weight.length - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : (
                  <span>N/A</span>
                )}
              </li>

              <li>
                <h5>Location:</h5>
                <span>{cropDetail.location || 'Jinja'}</span>
              </li>

              <li>
                <h5>Quantity Availability:</h5>
                <span>{cropDetail.availability || 'N/A'} (bags/sacks)</span>
              </li>

              <li>
                <h5>Description:</h5>
                <span>{cropDetail.description || 'No description available'}</span>
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
          <button className="delete" onClick={() => handleDelete(cropDetail.id)}>
            Delete <i className="bi bi-archive"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default Detail;
