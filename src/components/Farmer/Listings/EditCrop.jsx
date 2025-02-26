import React, { useState, useEffect, useContext } from 'react';
import '../Listings/Listings.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const all_categories_url = 'https://agrilink-backend-hjzl.onrender.com/agriLink/all_specialisations';

function EditCrop() {
  const { id } = useParams();
  const edit_crops_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/update_farmer_crop/${id}`;
  const detail_url = `https://agrilink-backend-hjzl.onrender.com/agriLink/crop_detail/${id}`;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [crop, setCrop] = useState({
    user: user.user_id,
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
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadContent, setLoadContent] = useState(false)

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

  // Fetch crop detail
  const fetch_crop_detail = async () => {
    setLoadContent(true)
    try {
      const response = await axios.get(detail_url);
      const data = response.data;
      setPreviewImage(data.image);
      // Adjusting data to match our state structure
      setCrop({
        ...data,
        weight: data.weight.map(w => ({ ...w, quantity: 0 })) || crop.weight // If weight is not provided, use default
      });
      setLoadContent(false)
    } catch (err) {
      console.log('An error occurred while fetching crop details.', err);
    }
  };

  useEffect(() => {
    fetch_categories();
    fetch_crop_detail();
  }, []);

  // Handle file selection
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setCrop({ ...crop, image: selectedImage });
      setPreviewImage(URL.createObjectURL(selectedImage));
    }
  };

  // Handle weight updates
  const updateWeight = (weightString, available) => {
    setCrop(prevState => ({
      ...prevState,
      weight: prevState.weight.map(w => 
        w.weight === weightString ? { ...w, available: Number(available), quantity: 0 } : w
      )
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('user', crop.user);
    formData.append('specialisation', crop.specialisation);
    formData.append('crop_name', crop.crop_name);
    formData.append('unit', crop.unit);
    formData.append('description', crop.description);
    formData.append('price_per_unit', crop.price_per_unit);
    formData.append('InitialAvailability', crop.InitialAvailability);
    formData.append('weight', JSON.stringify(crop.weight.filter(w => w.available > 0)));

    if (crop.image instanceof File) {
      formData.append('image', crop.image);
    } else if (typeof crop.image === 'string') {
      try {
        // Download the image from the URL if it's not updated
        const imageUrl = crop.image.replace('http://', 'https://')
        const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });
        const imageBlob = new Blob([imageResponse.data], { type: imageResponse.headers['content-type'] });
        const imageFile = new File([imageBlob], 'image.png');
        formData.append('image', imageFile);
      } catch (err) {
        setLoading(false);
        console.error(err);
        showErrorAlert('An error occurred while processing the image.');
        return;
      }
    }

    try {
      await axios.put(edit_crops_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      showSuccessAlert('Crop updated successfully');
      navigate(`/farmer/detail/${id}`);
    } catch (err) {
      setLoading(false);
      console.error(err);
      showErrorAlert('An error occurred while updating the crop. Please try again.');
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
    });
  }

  return (
    <>
      <h4>EDIT CROP</h4>

      {loadContent ? (<div className="list_loader"></div>) : (<>
        <div className="crop_upload bg-white p-2">
        <form className='row g-3 mt-3 p-2' onSubmit={handleSubmit}>
          <div className="image_bordering">
            <label htmlFor='image' className='text-primary text-decoration-underline upload_label form-label'>Choose Image to Upload</label>
            <input
              type="file"
              accept="image/*"
              id="image"
              className="form-control"
              hidden
              onChange={handleImageChange}
            />
            
            <div className="image-upload-container p-3 text-center">
              <img
                src={previewImage || ''}
                alt="Preview"
                className="uploaded_image"
              />
            </div>
          </div>

          <div className="col-md-6">
            <label htmlFor="cropName" className="form-label">Crop Name</label>
            <input
              type="text"
              className="form-control"
              id="cropName"
              value={crop.crop_name}
              onChange={(e) => setCrop({ ...crop, crop_name: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="category" className="form-label">Crop Category</label>
            <select
              className="form-control"
              id="category"
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
              onChange={(e) => setCrop({ ...crop, InitialAvailability: e.target.value })}
            />
          </div>

          {crop.unit === 'Kg' && (
            <div className="col-md-6">
              <label className="form-label">Enter the available weights (bags/sacks) for your product</label>
              <div className="weights edit_weight">
                <ul>
                  {crop.weight.map((w, index) => (
                    <li key={index}>
                      <input
                        type="checkbox"
                        id={w.weight}
                        checked={w.available > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateWeight(w.weight, 0); // Enable input
                          } else {
                            updateWeight(w.weight, 0); // Disable input, set to 0
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
                        disabled={w.available === 0}
                        placeholder="Available"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Crop'}
          </button>
        </form>
      </div>
      </>)}
      
    </>
  );
}

export default EditCrop;