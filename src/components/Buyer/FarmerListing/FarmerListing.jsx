import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import image from '../../images/maize.png';
import '../FarmerListing/farmListing.css';

const INTERESTS_URL = 'http://127.0.0.1:8000/agriLink/all_specialisations';
const FARMER_PROFILES_URL = 'http://127.0.0.1:8000/agriLink/farmer_profiles';

function FarmerListing() {
  const { user } = useContext(AuthContext);
  const {id} = useParams()
  const SINGLE_PROFILE_URL = user ? `http://127.0.0.1:8000/agriLink/profile/${user.user_id}` : '';
  const USER_PROFILE_URL = user ? `http://127.0.0.1:8000/agriLink/filter-farmers-by-location/${user.user_id}` : ''
  const SINGLE_USER_PROFILE = user ? `http://127.0.0.1:8000/agriLink/single_profile/${user.user_id}` : ''

  const [userName, setUserName] = useState(null);
  const [interests, setInterests] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInterestId, setSelectedInterestId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [userProfile, setUserProfile] = useState('')
  const [userLocation, setUserLocation] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserName();
    }
  }, [user]);

  const fetchUserName = async () => {
    try {
      const response = await axios.get(SINGLE_PROFILE_URL);
      setUserName(response.data.get_full_name);
    } catch (error) {
      console.error('Failed to fetch user name:', error);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await axios.get(INTERESTS_URL);
      setInterests(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchFarmers = async () => {
    try {
      const response = await axios.get(FARMER_PROFILES_URL);
      setFarmers(response.data.results);
      setFilteredFarmers(response.data.results);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // user profile
  const fetchBuyerprofile = async()=>{
    try{
    const response = await axios.get(SINGLE_USER_PROFILE)
    const data = response.data
    setUserProfile(data)
    }catch(err){
      console.log('err', err)
    }
  }

  useEffect(()=>{
    fetchBuyerprofile()
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    filterFarmers(value, selectedInterestId, userLocation);
  };

  // interest selection
  const handleInterestSelection = (id, name) => {
    setSelectedInterestId(id);
    setSelectedCategoryName(name);
    filterFarmers(search, id);
  };


  const filterFarmers = (searchTerm, interestId, userLocation) => {
    let filtered = farmers;
    
    if (interestId) {
      filtered = filtered.filter(farmer =>
        farmer.specialisation &&
        farmer.specialisation.some(spec => spec.id === interestId)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.farmName.toLowerCase().includes(searchTerm)
      );
    }

    if(userLocation){
      filtered = filtered.filter(farmer => farmer.location.toLowerCase() === userLocation.toLowerCase())
    }
    
    setFilteredFarmers(filtered);
  };

  const locationFilter = (location)=>{
  console.log(location)
   const filtered = farmers.filter(farmer => farmer.location.toLowerCase() === location.toLowerCase())
   setFilteredFarmers(filtered)
  }
 
  return (
    <div className='listing_wrapper bg-white p-3'>
      <Typography gutterBottom variant="h4" component="div" className='user_name'>
        Hello, {userName || 'Guest'} 👋
      </Typography>
      <h4 className='farm-list-header p-2'>Farmer Listing</h4>

      {selectedCategoryName && (
        <Typography variant="h6" className="category-title">
          Showing results for: {selectedCategoryName}
        </Typography>
      )}

      <div className="row sort_filtering bg-white p-2">
        <div className="dropdown col-md-3 sm-12">
          <button className="btn border dropdown-toggle" type="button" id="triggerId" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Sort by category
          </button>
          <div className="dropdown-menu dropdown-menu-right cat_drop_down" aria-labelledby="triggerId">
            {loading ? (
              <h6>Loading...</h6>
            ) : (
              interests.map(interest => (
                <a key={interest.id} className="dropdown-item" href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  handleInterestSelection(interest.id, interest.name);
                }}>{interest.name}</a>
              ))
            )}
          </div>
        </div>

        <form className="col-md-3 sm-12 d-flex ms-auto">
          <div className="input-group me-3">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              className="form-control border-start-0" 
              type="search" 
              placeholder="Search by farmName..." 
              aria-label="Search" 
              value={search} 
              onChange={handleSearchChange}
            />
          </div>
        </form>

        <div className="dropdown col-md-6 sm-12">
          <button className="btn border dropdown-toggle" type="button" id="filterId" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Filter by
          </button>
          <div className="dropdown-menu dropdown-menu-right" aria-labelledby="filterId">
            <a className="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault()
              locationFilter(userProfile.location)}}
              >Your Location</a>  
          </div>
        </div>
      </div>

      <div className="Farmer-cards mt-3">
        {loading ? (
          <div className="loader"></div>
        ) : (
          filteredFarmers.map(farmer => (
            <Card key={farmer.id} sx={{ maxWidth: 345 }} className='col-md-3 sm-12'>
              <CardMedia component="img" alt='crop name' height="140" image={farmer.image || image} />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {farmer.farmName} - {farmer.location}
                </Typography>
                <Typography variant="body4" color="text.secondary" className="farmer_crop_desc">
                  {farmer.bio || 'No bio available'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">
                  <Link to={`/Buyer/farmer_product_listing/${encodeURIComponent(farmer.user)}`} className="text-decoration-none">
                    View Detail
                  </Link>
                </Button>
                <Button size="small">Share</Button>
              </CardActions>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default FarmerListing;
