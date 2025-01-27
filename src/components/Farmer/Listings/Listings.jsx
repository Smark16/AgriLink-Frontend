import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import UseHook from '../../CustomHook/UseHook';
import '../Listings/Listings.css';

function Listings() {
  const { crops, currentPage, pagination, loader, filteredCrops, setFilteredCrops, handlePageChange } = UseHook();
  const [search, setSearch] = useState('');
  const [showOptions, setShowOptions] = useState({}); // Track options for each crop

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

  return (
    <>
      <nav className="navbar navbar-light bg-white">
        <div className="row container-fluid d-flex align-items-center g-2">
          <h4 className="col-md-3 sm-12">Listings</h4>
          <form className="col-md-4 sm-12 d-flex ms-auto">
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
          <span className="bg-success text-white p-2 cursor-pointer col-md-2 sm-12">
            <Link to="/farmer/upload_crop" className="text-white text-decoration-none">
              UPLOAD CROP
            </Link>
          </span>
        </div>
      </nav>

      {loader ? (
        <div className="loader"></div>
      ) : (
        <>
          {filteredCrops.length === 0 && (
            <div className="no_crops mt-5 text-center">
              <h5 className="text-muted">No crops uploaded</h5>
              <i className="bi bi-tree-fill text-secondary" style={{ fontSize: '2rem' }}></i>
            </div>
          )}
          <div className="cards mt-3">
            {filteredCrops.map((crop) => {
              const { id, crop_name, description, image } = crop;
              const shareUrl = encodeURIComponent(window.location.origin + `/farmer/detail/${id}`);
              const encodedDescription = encodeURIComponent(description);
              const encodedImage = encodeURIComponent(`http://127.0.0.1:8000${image}`);

              return (
                <Card key={id} sx={{ maxWidth: 345 }}>
                  <CardMedia
                    component="img"
                    alt={crop_name}
                    height="140"
                    image={`http://127.0.0.1:8000${image}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {crop_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                      className="farmer_crop_desc"
                    >
                      {description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">
                      <Link to={`/farmer/detail/${id}`} className="text-decoration-none">
                        View Detail
                      </Link>
                    </Button>
                    <div className="share-button-container">
                      <Button
                        className="share-button"
                        size="small"
                        onClick={() => toggleOptions(id)}
                      >
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
                  </CardActions>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      <nav aria-label="Page navigation">
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
    </>
  );
}

export default Listings;
