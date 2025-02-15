import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import UseHook from '../../CustomHook/UseHook';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../Listings/Listings.css';

function Listings() {
  const { crops, currentPage, pagination, loader, filteredCrops, setFilteredCrops, handlePageChange } = UseHook();
  const [search, setSearch] = useState('');
  const [showOptions, setShowOptions] = useState({}); // Track options for each crop
  const [loading, setLoading] = useState(false);

  const toggleOptions = (id) => {
    setShowOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Search for crops
  const handleCropSearch = (e) => {
    setSearch(e.target.value);
    setFilteredCrops(
      crops.filter((crop) => crop.crop_name.toLowerCase().includes(e.target.value.toLowerCase()))
    );
  };

  // Determine if a crop is sold out
  const isSoldOut = (crop) => {
    if (crop.weight && crop.weight.length > 0) {
      // If there are weights, sum up all available quantities
      return crop.weight.reduce((sum, weight) => sum + weight.available, 0) <= 0;
    } else {
      // If there are no weights, just check the availability
      return crop.availability <= 0;
    }
  };

  const handleRemoveCrop = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`https://agrilink-backend-hjzl.onrender.com/agriLink/delete_farmer_crop/${id}`);
      const remained = crops.filter((crop) => crop.id !== id);
      setFilteredCrops(remained);
      Swal.fire({
        title: 'Product removed successfully',
        icon: 'error',
        timer: 6000,
        toast: true,
        position: 'top',
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error deleting crop:', err);
      Swal.fire({
        title: 'Error deleting crop. Please try again.',
        icon: 'error',
        timer: 6000,
        toast: true,
        position: 'top',
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <>
    <div className="container-fluid">
      <div className="row px-xl-5">
        <div className="col-lg-12 col-md-12 col-sm-12 pb-1">
          <nav className="navbar navbar-light bg-white w-100">
            <div className="container-fluid d-flex align-items-center g-2">
              <h4 className="col-md-3 col-sm-12">Listings</h4>
              <form className="col-md-4 col-sm-12 d-flex ms-auto">
                <div className="input-group me-3">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    className="form-control border-start-0"
                    type="search"
                    placeholder="Search..."
                    aria-label="Search"
                    value={search}
                    onChange={handleCropSearch}
                  />
                </div>
              </form>
              <span className="bg-success text-white p-2 cursor-pointer col-md-2 col-sm-12">
                <Link to="/farmer/upload_crop" className="text-white text-decoration-none">
                  UPLOAD CROP
                </Link>
              </span>
            </div>
          </nav>
        </div>

        <div className="col-lg-12 col-sm-12 pb-1">
          {loader ? (
            <div className="list_loader"></div>
          ) : (
            <>
              {filteredCrops.length === 0 && (
                <div className="no_crops mt-5 text-center">
                  <h5 className="text-muted">No crops uploaded</h5>
                  <i className="bi bi-tree-fill text-secondary" style={{ fontSize: '2rem' }}></i>
                </div>
              )}
              <div className="row mt-3">
                {filteredCrops.map((crop) => {
                  const { id, crop_name, description, image } = crop;
                  const shareUrl = encodeURIComponent(window.location.origin + `/farmer/detail/${id}`);
                  const encodedDescription = encodeURIComponent(description);
                  const encodedImage = encodeURIComponent(`https://agrilink-backend-hjzl.onrender.com${image}`);

                  const soldOut = isSoldOut(crop); // Check if sold out

                  return (
                    <>
                     {/* <div>
                        <Helmet>
                          <meta property="og:title" content={crop_name} />
                          <meta property="og:description" content={description} />
                          <meta property="og:image" content={`http://127.0.0.1:8000${image}`} />
                          <meta property="og:url" content={`http://127.0.0.1:8000/farmer/detail/${id}`} />
                        </Helmet>
                     
                      </div> */}

                    <div key={id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                      <Card sx={{ maxWidth: 345 }} className={soldOut ? 'soldout' : ''}>
                        <CardMedia
                          component="img"
                          alt={crop_name}
                          height="140"
                          image={`https://agrilink-backend-hjzl.onrender.com${image}`}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="div">
                            {crop_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }} className="farmer_crop_desc">
                            {description}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          {!soldOut ? (
                            <>
                              <Button size="small">
                                <Link to={`/farmer/detail/${id}`} className="text-decoration-none">
                                  View Detail
                                </Link>
                              </Button>
                              <div className="share-button-container">
                                <Button className="share-button" size="small" onClick={() => toggleOptions(id)}>
                                  Share
                                </Button>
                                {showOptions[id] && (
                                  <div className="share-options">
                                    <a
                                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodedDescription}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="share-option"
                                    >
                                      <i className="bi bi-facebook"></i>
                                    </a>
                                    <a
                                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodedDescription}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="share-option"
                                    >
                                      <i className="bi bi-twitter"></i>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <Button size="small" className="p-2" variant="contained" color="error" disabled>
                                Sold Out
                              </Button>
                              <button className="bg-success remove_crop text-white p-2 rounded" onClick={() => handleRemoveCrop(id)}>
                                {loading ? 'Removing...' : 'Remove'}
                              </button>
                            </>
                          )}
                        </CardActions>
                      </Card>
                    </div>
                    
                    </>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${!pagination.previous ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.previous, 'previous')}
                  disabled={!pagination.previous}
                >
                  Previous
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link">{currentPage}</span>
              </li>
              <li className={`page-item ${!pagination.next ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.next, 'next')}
                  disabled={!pagination.next}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    
    </>
  );
}

export default Listings;