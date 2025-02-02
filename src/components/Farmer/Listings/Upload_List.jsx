import React, { useState, useEffect, useContext } from 'react';
import '../Listings/Listings.css';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import TransportDetails from './TransportDetails';

const steps = [
  'Product Information',
  'Delivery Options',
  'Payment Options',
];

const all_categories_url = 'http://127.0.0.1:8000/agriLink/all_specialisations';
const post_crops_url = 'http://127.0.0.1:8000/agriLink/post_crops';

function Upload_List() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [crop, setCrop] = useState({
    user: user?.user_id,
    specialisation: '',
    crop_name: '',
    unit: '',
    description: '',
    weight: [
      { weight: '5kg', quantity: 0, available: 0 },
      { weight: '10kg', quantity: 0, available: 0 },
      { weight: '50kg', quantity: 0, available: 0 },
      { weight: '100kg', quantity: 0, available: 0 }
    ],
    price_per_unit: 0,
    InitialAvailability: 0,
    image: '',
  });
  const [imageUploaded, setImageUploaded] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all categories
  const fetch_categories = async () => {
    try {
      const response = await axios.get(all_categories_url);
      const data = response.data;
      setCategories(data);
    } catch (err) {
      console.log('An error occurred while fetching categories.');
    }
  };

  useEffect(() => {
    fetch_categories();
  }, []);

  // Handle file selection via drag-and-drop or browse
  const handleImageChange = (e) => {
    const selectedImage = e.target.files ? e.target.files[0] : e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    
    if (selectedImage) {
      setImageUploaded(selectedImage);
      setCrop({ ...crop, image: selectedImage });
    }
  };

  // Prevent default drag behavior
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Handle drag leave event to revert styling when the drag leaves the area
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleImageChange(e);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

    formData.append('user', crop.user);
    formData.append('specialisation', crop.specialisation);
    formData.append('crop_name', crop.crop_name);
    formData.append('unit', crop.unit);
    formData.append('description', crop.description);
    formData.append('price_per_unit', crop.price_per_unit);
    formData.append('InitialAvailability', crop.InitialAvailability);
    formData.append('image', crop.image);
    formData.append('weight', JSON.stringify(crop.weight.filter(w => w.available > 0)));

      const response = await axios.post(post_crops_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLoading(false);
      showSuccessAlert('Product uploaded successfully');
      navigate('/farmer/listings');
    } catch (err) {
      setLoading(false);
      showErrorAlert('An error occurred while uploading the crop. Please try again.');
    }
  };

  // Show error alerts
  const showErrorAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "error",
      timer: 6000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
      showConfirmButton:false
    });
  };

  // Show success alert
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "success",
      timer: 6000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
      showConfirmButton:false
    });
  }

  const updateWeight = (weightString, available) => {
    setCrop(prevState => ({
      ...prevState,
      weight: prevState.weight.map(w => 
        w.weight === weightString ? { ...w, available: Number(available), quantity: 0 } : w
      )
    }));
  };

  // console.log(payment)

  return (
    <>
    <div className="container-fluid pt-2">
      <div className="upload-header p-2">
      <h4>UPLOAD CROP</h4>
      <Box sx={{ width: '100%' }}>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel className='text-white'>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
      </div>

      <div className="crop_upload bg-white p-2 mt-3">
        <form className='row g-3 mt-3 p-2' onSubmit={handleSubmit}>
          <div className="image_bordering">
            <input
              type="file"
              accept="image/*"
              id="image"
              hidden
              onChange={handleImageChange}
            />
            <div
              className="image-upload-container p-3 text-center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: imageUploaded || dragging ? 'none' : '2px dashed #007bff',
                borderRadius: '5px',
                backgroundColor: dragging
                  ? '#d1e7fd'
                  : imageUploaded
                  ? '#f8f9fa'
                  : '#e9ecef',
                transition: 'background-color 0.3s ease',
              }}
            >
              {imageUploaded ? (
                <img
                  src={URL.createObjectURL(imageUploaded)}
                  alt="Uploaded"
                  className="uploaded_image"
                />
              ) : (
                <>
                  <i className="bi bi-cloud-upload fs-1 text-primary"></i>
                  <p className="mt-2 mb-0">
                    Drag and drop images here to upload, or{" "}
                    <label
                      htmlFor="image"
                      className="text-primary text-underline"
                      style={{ cursor: "pointer" }}
                    >
                      browse
                    </label>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <label htmlFor="cropName" className="form-label">Product Name</label>
            <input
              type="text"
              className="form-control"
              id="cropName"
              value={crop.crop_name}
              onChange={(e) => setCrop({ ...crop, crop_name: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="specialisation" className="form-label">Product Category</label>
            <select
              className="form-control"
              id="specialisation"
              value={crop.specialisation}
              onChange={(e) => setCrop({ ...crop, specialisation: parseInt(e.target.value) })}
            >
              <option value="">Choose Crop Category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="unit" className="form-label">Product Unit</label>
            <select
              className="form-control"
              id="unit"
              value={crop.unit}
              onChange={(e) => setCrop({ ...crop, unit: e.target.value })}
            >
              <option value="">Choose Unit</option>
              <option value="Tray">Tray</option>
              <option value="Kg">Kg</option>
              <option value="Cluster">Cluster</option>
              <option value="Litre">Litre</option>
              <option value="(Bag/sack)">Bags/sacks</option>
              <option value="Whole Item">Whole Item (cow, hen)</option>
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="pricePerUnit" className="form-label">Price per {crop.unit || 'unit'}</label>
            <input
              type="number"
              className="form-control"
              id="pricePerUnit"
              value={crop.price_per_unit}
              onChange={(e) => setCrop({ ...crop, price_per_unit: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              value={crop.description}
              onChange={(e) => setCrop({ ...crop, description: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="availability" className="form-label">Quantity Available</label>
            <input
              type="number"
              className="form-control"
              id="InitialAvailability"
              value={crop.InitialAvailability}
              onChange={(e) => setCrop({ ...crop,  InitialAvailability: e.target.value })}
            />
          </div>

          {crop.unit === 'Kg' && (
            <div className="col-md-6">
              <label className="form-label">Enter the available weights (bags/sacks) for your product</label>
              <div className="weights">
                <ul>
                  {crop.weight.map((w, index) => (
                    <li key={index}>
                      <input
                        type="checkbox"
                        id={w.weight}
                        checked={w.available > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // If checked, enable input
                            updateWeight(w.weight, 0);
                          } else {
                            // If unchecked, set available to 0
                            updateWeight(w.weight, 0);
                          }
                        }}
                      />
                      <span>{w.weight}</span>
                      <input
                        type="number"
                        className="form-control"
                        style={{width: '70px', marginLeft: '10px'}}
                        value={w.available}
                        onChange={(e) => updateWeight(w.weight, e.target.value)}
                        placeholder="Available"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
            
            {/* transport details */}

          <button
            type="submit"
            className='upload_btn'
            disabled={loading || !crop.crop_name || !crop.unit || !crop.description || !crop.price_per_unit || !crop.InitialAvailability || !crop.image}
            >
            {loading ? 'Uploading...' : 'Upload Crop'}
          </button>
        </form>
            <TransportDetails/>
      </div>
    </div>
    </>
  );
}

export default Upload_List;