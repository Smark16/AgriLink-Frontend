import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import '../FarmerInfo/Info.css';
import Districts from '../FarmerInfo/Districts';
import Select from 'react-select';
import { AuthContext } from '../../Context/AuthContext';
import UseHook from '../../CustomHook/UseHook';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const interests_url = 'https://agrilink-backend-hjzl.onrender.com/agriLink/all_specialisations';

function Info() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate()
  const { formData, setFormData } = UseHook();
  const [loading, setLoading] = useState(false)
  const [successLoader, setSuccessLoader] = useState(false)
  
  // Check if user is available before constructing URL
  const update_profile_url = user 
    ? `https://agrilink-backend-hjzl.onrender.com/agriLink/update_profile/${encodeURIComponent(user.user_id)}`
    : '';

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [Interests, setInterests] = useState([]);

  // Fetch interests
  const fetchInterests = async () => {
    setLoading(true)
    try {
      const response = await axios.get(interests_url);  // Added .get method
      const data = response.data;
      setInterests(data);
      setLoading(false)
    } catch (err) {
      console.error('Error fetching interests:', err);  // Changed console.log to console.error for errors
    }
  };


  useEffect(() => {
    fetchInterests();
  }, []);

  // Convert district names into react-select options
  const districtOptions = Districts.map((district) => ({
    value: district,
    label: district,
  }));

  // Handle district change
  const handleChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    setFormData({ ...formData, location: selectedOption ? selectedOption.value : '' });
  };

  // Handle interest selection
  const handleInterestClick = (interest) => {
    if (selectedInterests.includes(interest.id)) {
      // Remove interest if already selected
      const updatedInterests = selectedInterests.filter((item) => item !== interest.id);
      setSelectedInterests(updatedInterests);
      setFormData({ ...formData, specialisation: updatedInterests });
    } else {
      // Add interest
      setSelectedInterests([...selectedInterests, interest.id]);
      setFormData({ ...formData, specialisation: [...selectedInterests, interest.id] });
    }
  };
console.log(formData)
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessLoader(true)
    if (update_profile_url) {  // Check if URL is not empty
      axios.put(update_profile_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          if(response.status === 200){
            navigate('/farmer/listings')
            setSuccessLoader(false)
          }
        })
        .catch(err => {
          console.error('Error updating profile:', err);  // Use console.error for errors
          setSuccessLoader(false)
        });
    } else {
      console.error('User ID is not available to update profile.');  // Log an error if user ID isn't available
    }
  };

  return (
    <>
      <div className="interest_overlay"></div>
      <div className="row info_wrapper">
        <h4 className="text-center text-success">AgriLink</h4>

        <div className="farm_info mt-5 sm-12 col-md-9">
          <div className="other_text">
            <span className="text-center first_span">Almost there!</span>
            <span className="text-center">
              Finish creating your profile for a full AgriLink experience
            </span>
          </div>

          <form onSubmit={handleSubmit} className="sm-12">
            <Box component="div" noValidate autoComplete="off">
              <div className="mb-6 sm-12 farm_fields">
                <label htmlFor="farmName" className="text-center">
                  Enter Farm Name (If any)
                </label>
                <TextField
                  id="farmName"
                  name="farmName"
                  label="Farm Name..."
                  variant="standard"
                  value={formData.farmName}
                  onChange={(e) =>
                    setFormData({ ...formData, farmName: e.target.value })
                  }
                />
              </div>

              <div className="farm_fields sm-12 mt-3">
                <label htmlFor="farmLocation" className="text-center">
                  Enter Farm Location (District)
                </label>
                <Select
                  value={selectedDistrict}
                  onChange={handleChange}
                  options={districtOptions}
                  placeholder="Select District"
                />
                {selectedDistrict && <p>Selected District: {selectedDistrict.label}</p>}
              </div>
            </Box>

            <div className="specializations mt-4">
              <h5>What are you interested in?</h5>
              <span className="text-center int_span">Choose one or more</span>

              <div className="interest_areas mt-3">
                {loading ? (<>
                  <div className="loading-container">
          <div className="spinner-border text-primary text-center" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
         
        </div>
                </>) : (
                  <>
                  {Interests.map((interest) => (
                    <Button
                      key={interest.id}
                      variant="outlined"
                      color={selectedInterests.includes(interest.id) ? 'success' : 'default'}
                      onClick={() => handleInterestClick(interest)}
                      sx={{
                        margin: '5px',
                        borderRadius: '20px',
                        textTransform: 'none',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {interest.name}
                    </Button>
                  ))}
                  
                  </>
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={Interests.length < 1}  // Disable if no user or no interests
              >
                {successLoader ? 'Confirming...' : 'Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Info;