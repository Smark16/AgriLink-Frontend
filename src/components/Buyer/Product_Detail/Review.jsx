import React, { useState, useEffect, useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import moment from 'moment';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import UseHook from '../../CustomHook/UseHook';
import Swal from 'sweetalert2';

const post_rates = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_ratings'

function Review({ product }) {
  const [reviews, setReviews] = useState([]);
  const [item, setItem] = useState(null);
  const { formData } = UseHook();
  const { user } = useContext(AuthContext);
  const [ReviewformData, setReviewFormData] = useState({
    message: "",
    user: user.user_id,
    profile: "",
    crop: product?.id || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product?.crop_review) {
      setReviews(product.crop_review);
    }

  }, [product]);

  // Handle reviews submission
  const handleReviews = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formdata = new FormData();
    formdata.append("message", ReviewformData.message);
    formdata.append("user", user.user_id);
    formdata.append("profile", formData.id);
    formdata.append("crop", product.id);

    try {
      const response = await axios.post(
        'https://agrilink-backend-hjzl.onrender.com/agriLink/post_reviews',
        formdata
      );
      if (response.status === 201) {
        showSuccessAlert('Review added');
        // Add the new review to the list
        setReviews([...reviews, response.data]);
        // Reset form data
        setReviewFormData({
          message: "",
          user: user.user_id,
          profile: "",
          crop: product?.id || "",
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      Swal.fire({
        title: 'Failed to submit review',
        icon: 'error',
        timer: 6000,
        toast: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "success",
      timer: 6000,
      toast: true,
      position: 'top',
    });
  };

  // star rating
  useEffect(() => {
    const handleStarClick = (star) => {
      let children = star.parentElement.children;
      for (let child of children) {
        if (child.getAttribute('data-clicked')) {
          return false;
        }
      }
      star.setAttribute('data-clicked', true);
      let rating = parseInt(star.dataset.star);
      let product = parseInt(star.parentElement.dataset.key);

      let data = {
        crop: product,
        value: rating,
        user:user.user_id,
      };
      console.log(data);
      axios
        .post(post_rates, data)
        .then((response) => {
          console.log(response);
        })
        .catch((err) => console.log(err.response));
      let ratings = JSON.parse(localStorage.getItem('rating')) || [];
      ratings.push(data);
      localStorage.setItem('rating', JSON.stringify(ratings));
    };

    let stars = document.querySelectorAll('.stars i');

    for (let star of stars) {
      star.addEventListener('click', () => {
        handleStarClick(star);
      });
    }
  }, [product]);

  // rated stars
  const renderStars = (userRating) => {
    const stars = [];
    const ratedStars = Math.round(userRating || 0);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <i key={i} className={`bi ${i < ratedStars ? 'bi-star-fill' : 'bi-star'}`} />
      );
    }

    return stars;
  };

  return (
    <>
      <div className="row px-xl-5">
        <div className="col">
          <div className="nav nav-tabs justify-content-center border-secondary mb-4">
            <a className="nav-item nav-link">
              Reviews ({reviews.length})
            </a>
          </div>
          <div>
            <div className="row">
              <div className="col-md-6">
                <h4 className="mb-4">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} for "{product?.crop_name || 'Product'}"
                </h4>
                {reviews.length === 0 && <h5>No reviews available</h5>}
                {reviews.map((review, index) => {
                  const relativeTime = moment(review?.timestamp).fromNow();
                  return (
                    <div className="media mb-4" key={review.id || index}>
                      <Avatar
                        alt={review.user?.get_full_name || 'User'}
                        src={`https://agrilink-backend-hjzl.onrender.com${review.profile?.image || ''}`}
                        className="profile"
                      />
                      <div className="media-body">
                        <h6>
                          {review.user?.get_full_name || 'Anonymous'}
                          <small> - <i>{relativeTime}</i></small>
                        </h6>
                        <div className="mr-2 strs">
                        {renderStars(
                          product.ratings.find(rate => rate.user === review.user?.id)?.value || 0
                        )}
                        </div>
                        <p>{review.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add review form */}
              <div className="col-md-6">
                <h4 className="mb-4">Leave a review</h4>
                <div className="d-flex my-3">
                  <p className="mb-0 mr-2">Your Rating * :</p>
                  <div className="stars" data-key={`${product.id}`}>
                  <i data-star="5" className="bi bi-star-fill"></i>
                  <i data-star="4" className="bi bi-star-fill"></i>
                  <i data-star="3" className="bi bi-star-fill"></i>
                  <i data-star="2" className="bi bi-star-fill"></i>
                  <i data-star="1" className="bi bi-star-fill"></i>
                  </div>
                </div>
                <form onSubmit={handleReviews}>
                  <div className="form-group">
                    <label htmlFor="message">Your Review *</label>
                    <textarea
                      id="message"
                      cols={30}
                      rows={5}
                      className="form-control"
                      name="message"
                      value={ReviewformData.message}
                      onChange={(e) => setReviewFormData({
                        ...ReviewformData,
                        message: e.target.value,
                      })}
                    />
                  </div>
                  <div className="form-group mb-0 mt-2">
                    <button
                      type="submit"
                      className="btn btn-success p-2 text-white text-center w-50"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Review;
