import React, {useContext, useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import UseHook from '../CustomHook/UseHook';

import '../Listings/Listings.css'

function Listings() {
  const {crops, currentPage, pagination, loader, filteredCrops, setFilteredCrops, handlePageChange} = UseHook()
  
  const [search, setSearch] = useState([])
 
  // search for crops
  const handleCropSearch = (e)=>{
    setSearch(e.target.value)
    setFilteredCrops(crops.filter(crop => crop.crop_name.toLowerCase().includes(e.target.value.toLowerCase())))
    console.log(filteredCrops)
  }

  return (
    <>
      <nav className="navbar navbar-light bg-white">
        <div className="row container-fluid d-flex align-items-center g-2">
          <h4 className='col-md-3 sm-12'>Listings</h4>
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
                onChange={handleCropSearch}
              />
            </div>
          </form>

          <span className='bg-success text-white p-2 cursor-pointer col-md-2 sm-12'><Link to='/farmer/upload_crop' className='text-white text-decoration-none'>UPLOAD CROP</Link></span>
        </div>
      </nav>

{loader ? (<div className='loader'></div>) : (
  <>
  {filteredCrops.length === 0 && (<>
  <div className='no_crops mt-5'>
    <h3 className='text-center'>No Crops Uploaded yet</h3>
    </div>
  </>)}
   <div className="cards mt-3">
      {filteredCrops.map(crop => {
        const {id,crop_name, description, image} = crop
        return (
          <>
      <Card sx={{ maxWidth: 345 }} >
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={`http://127.0.0.1:8000${image}`}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {crop_name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} className='farmer_crop_desc'>
         {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small"><Link to={`/farmer/detail/${id}`} className='text-decoration-none'>View Detail</Link></Button>
        <Button size="small">Share</Button>
      </CardActions>
    </Card>
          </>
        )
      })}
 
      </div>

  </>
)}
     
      {/* pagination */}
     <nav aria-label="Page navigation">
        <ul className="pagination">
          <li className={`page-item ${!pagination.previous}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(pagination.previous, "previous")}
              // disabled={!pagination.previous}
            >
              Previous
            </button>
          </li>
          <li className="page-item active">
            <span className="page-link">{currentPage}</span>
          </li>
          <li className={`page-item ${!pagination.next}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(pagination.next, "next")}
              // disabled={!pagination.next}
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
