import React, { useContext, useEffect, useState } from 'react';
import profile from '../../images/rec_4.png';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import '../FarmerProfile/farmerProfile.css';
import Swal from 'sweetalert2';
import UseAxios from '../../AxiosInstance/AxiosInstance';
import moment from 'moment';
import UseHook from '../../CustomHook/UseHook';

function FarmerProfile() {
  const { user } = useContext(AuthContext);
  const {previewImage, formData, setFormData, setPreviewImage, fetch_profile, profileLoader, showProfileModal} = UseHook()
  const [farmImage, setFarmImage] = useState('')
  const axiosInstance = UseAxios()

   // Encode user_id to prevent injection
   const encodedUserId = encodeURIComponent(user.user_id);

  const update_user_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/update_user/${encodedUserId}`;
  const single_user_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/single_user/${encodedUserId}`

  const update_profile_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/update_profile/${encodedUserId}`;
  
  const [showModal, setShowModal] = useState(false);
  const [dateFormat, setDateFormat] = useState();
  const [userData, setUserData] = useState({username:'', is_buyer:false, is_farmer:true, email:'', date_joined:''})
 const [update, setUpdate] = useState(false)
 const [Image, setImage] = useState(null)

  // format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };


  const relativeTime = moment(formData.timestamp).fromNow();

  // fetch user
  const fetch_user = async()=>{
    try{
      const response = await axios.get(single_user_url)
      const data = response.data
      const formattedDate = formatDate(data.date_joined);
      setDateFormat(formattedDate);
     setUserData(data)
    }catch(err){
      console.log('err', err)
    }
  }

  useEffect(() => {
    fetch_user();
  }, []);

  // handle image change
  const handleImageChange = (e)=>{
    const selectedImage = e.target.files[0]

    if(selectedImage){
      setFormData({...formData, image:selectedImage})
      setPreviewImage(URL.createObjectURL(selectedImage)); // Update the preview URL
    }
  }
  
  // handle input change
  const handleProfile = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handle user
  const handleUser = (e)=>{
    setUserData({
      ...userData, [e.target.name]: e.target.value
    })
  }

  // handle update profile submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdate(true)
    const userdata = new FormData()
    const formdata = new FormData()

    // user info
    userdata.append('username', userData.username)
    userdata.append('email', userData.email)
    userdata.append('is_farmer', userData.is_farmer)
    userdata.append('is_buyer', userData.is_buyer)
    userdata.append('date_joined', userData.date_joined)

    // profile info
    formdata.append('bio', formData.bio)
    formdata.append('location', formData.location)
    formdata.append('farmName', formData.farmName)

    // Only append the image if it has been changed
    if (formData.image && typeof formData.image !== 'string') {
      formdata.append('image', formData.image);
      // formdata.append('farm_Image', formData.farm_Image)
    }

    if (formData.farm_Image && typeof formData.farm_Image !== 'string') {
      formdata.append('farm_Image', formData.farm_Image)
    }
  
    try{
       const useresponse = await axiosInstance.put(update_user_url, userdata)
       const profile_response = await axiosInstance.put(update_profile_url, formdata)

       if(useresponse.status === 201 && profile_response.status === 200){
        await fetch_profile()
        showSuccessAlert("Profile Updated");
        setUpdate(false)
        setShowModal(false)
        setImage(profile_response.data.image)
        console.log(profile_response.data)
       }
    }catch(err){
      console.log('err', err)
    }
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "success",
      timer: 2000,
    });
  };

  return (
    <>
      <div className="green p-3">
        <h4 className="text-center text-white">View Profile</h4>
      </div>

      <div className="profile_main">
        <div className="profile_email">
          <Avatar alt={userData.get_full_name} src={`${Image ? `https://res.cloudinary.com/dnsx36nia/${Image}` : `https://res.cloudinary.com/dnsx36nia/${previewImage}` }`} className="profile" />
          <div className="email">
            <h5>{userData.get_full_name}</h5>
            <span>{userData.email}</span>
          </div>
          <div className="edit_profile_btn ms-auto">
            <button onClick={() => setShowModal(true)}>Edit</button>
          </div>
        </div>

        <form className="row g-3 mt-3">
          <>
            <div className="col-md-6">
              <label htmlFor="inputEmail4" className="form-label">
                Farm Name
              </label>
              <input
                type="text"
                className="form-control"
                id="inputEmail4"
                readOnly
                value={formData.farmName}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">
                Date Joined
              </label>
              <input
                type="text"
                className="form-control"
                id="inputPassword4"
                readOnly
                value={dateFormat}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="inputEmail4" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="inputEmail4"
                readOnly
                value={userData.username}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">
                Location
              </label>
              <input
                type="text"
                className="form-control"
                id="inputPassword4"
                readOnly
                value={formData.location}
                placeholder='add location.......'
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">
                Bio
              </label>
              <input
                type="text"
                className="form-control"
                id="inputPassword4"
                readOnly
                value={formData.bio}
                placeholder='add bio.....'
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="inputPassword4" className="form-label">
                Specialisations
              </label>
              <input
                type="text"
                className="form-control"
                id="inputPassword4"
                readOnly
                value={formData.specialisation.map(special => special.name).join(', ')}
              />
            </div>

            <div className="col-md-6">
            <label htmlFor="farm_images" className="form-label">
              <strong>Farm Image</strong>
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              id="farm_image"
              hidden
             readOnly
            />
            {formData.farm_Image ? (
              <p>File selected: <img src={`https://res.cloudinary.com/dnsx36nia/${formData.farm_Image}`} className='farm_image'/></p>
            ) : (
              <p>No farm image available</p>
            )}
          </div>
          </>
        </form>

        <h5 className="more_profile_title mt-4">My email Address</h5>
        <div className="more_profile_info">
          <Avatar alt={userData.get_full_name} src={`${Image ? `https://res.cloudinary.com/dnsx36nia/${Image}` : `https://res.cloudinary.com/dnsx36nia/${previewImage}` }`}  className="profile" />
          <div className="more_email">
            <span>{userData.email}</span>
            <span>{relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Update Profile</h5>
              <button type="button" className="close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="user_profile">
              
                  <div className="photo">
                    <span>Photo</span>
                    <Avatar alt={userData.get_full_name} src={previewImage || `https://res.cloudinary.com/dnsx36nia/${formData.image}`}  className="profile" />
                  </div>
                  <div className="actions">
                  <input
                  type='file'
                  accept='image/*'
                  id='profile_image'
                  hidden='true'
                  onChange={handleImageChange}/>
          
                    <label htmlFor="profile_image">
                    <i className="bi bi-pen-fill text-primary">update photo</i>
                    </label>
                   
                    <p>
                      Recommended: JPG, PNG, or GIF
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleUser}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Username
                  </label>
                  <input
                    type='number'
                    className="form-control"
                    id="username"
                    name="username"
                    value={userData.username}
                    onChange={handleUser}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleProfile}
                     placeholder='add location.....'
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleProfile}
                    placeholder='add bio.....'
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="bio"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleProfile}
                    placeholder='add farm name.....'
                  />
                </div>

                <div className="mb-3 farm-edit">
                  <label htmlFor="farm" className="form-label btn btn-success p-2 text-white">
                    Edit Farm Image
                  </label>
                  <input
                    type="file"
                    accept='image/*'
                    className="form-control"
                    id="farm"
                    hidden
                    onChange={(e) => {
                      // Handle file input change
                      const file = e.target.files[0];
                      if (file) {
                      setFarmImage(URL.createObjectURL(file))
                        // Update your state or form data with the file
                        setFormData({ ...formData, farm_Image: file });
                      }
                    }}
                  />
                  <img src={farmImage || `https://res.cloudinary.com/dnsx36nia/${formData.farm_Image}`} className='farm_image'/>
                </div>

                <button type="submit" className='update_profile'>
                {update ? 'Updating...' : 'Update'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      {showProfileModal && profileLoader && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
            </div>
            <div className="custom-modal-body p-2 justify-content-center d-flex">
            <div className="status_loader"></div>
            <h6>Loading Farmer Profile.....</h6>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FarmerProfile;
