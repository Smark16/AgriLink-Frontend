import React, { useState, useEffect, useContext } from 'react';
import '../Listings/Listings.css';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const all_categories_url = 'http://127.0.0.1:8000/agriLink/all_categories';
const post_crops_url = 'http://127.0.0.1:8000/agriLink/post_crops';

function Upload_List() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [crop, setCrop] = useState({
    user: user.user_id,
    category: '',
    crop_name: '',
    description: '',
    weight: [],
    price_per_kg: 0,
    availability: 0,
    image: ''
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
  
    // Create FormData object to send data with the image
    const formData = new FormData();
    formData.append('user', crop.user);
    formData.append('category', crop.category);
    formData.append('crop_name', crop.crop_name);
    formData.append('description', crop.description);
    formData.append('price_per_kg', crop.price_per_kg);
    formData.append('availability', crop.availability);
    formData.append('image', crop.image);
    
   // Append the entire weight array as a JSON string
  formData.append('weight', JSON.stringify(crop.weight));

    try {
      const response = await axios.post(post_crops_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLoading(false);
      showSuccessAlert('crop uploaded sucessfully')
      navigate('/farmer/listings')
    } catch (err) {
      setLoading(false);
      showErrorAlert ('An error occurred while uploading the crop. Please try again.')
      // console.log('Error uploading crop:', err);
    }
  };
  
  // show error alerts
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

  // show success alert
  const showSuccessAlert = (message) =>{
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
      <h4>UPLOAD CROP</h4>
      <div className="crop_upload bg-white p-2">
        <form className='row g-3 mt-3 p-2' onSubmit={handleSubmit}>
          <div className="image_bordering">
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              id="image"
              hidden
              onChange={handleImageChange}
            />
            {/* Drop zone */}
            <div
              className="image-upload-container p-3 text-center"
              onDragOver={handleDragOver} // Allow the drop
              onDragLeave={handleDragLeave} // Revert styling when drag leaves the area
              onDrop={handleDrop} // Handle the drop
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
                  src={URL.createObjectURL(imageUploaded)} // Dynamically set the image source
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
              value={crop.category}
              onChange={(e) => setCrop({ ...crop, category: parseInt(e.target.value) })}
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
            <label htmlFor="pricePerKg" className="form-label">Price per kg</label>
            <input
              type="number"
              className="form-control"
              id="pricePerKg"
              value={crop.price_per_kg}
              onChange={(e) => setCrop({ ...crop, price_per_kg: e.target.value })}
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
              id="availability"
              value={crop.availability}
              onChange={(e) => setCrop({ ...crop, availability: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Enter the available weights (sizes) for your product</label>
            <div className="weights">
              <ul>
                
                <li>
                  <input
                    type="checkbox"
                    id="5kg"
                    onChange={() => {
                      const newWeight = crop.weight.includes('5kg') ? crop.weight.filter(w => w !== '5kg') : [...crop.weight, '5kg'];
                      setCrop({ ...crop, weight: newWeight });
                    }}
                  />
                  <span>5 kg</span>
                </li>
                <li>
                  <input
                    type="checkbox"
                    id="10kg"
                    onChange={() => {
                      const newWeight = crop.weight.includes('10kg') ? crop.weight.filter(w => w !== '10kg') : [...crop.weight, '10kg'];
                      setCrop({ ...crop, weight: newWeight });
                    }}
                  />
                  <span>10 kg</span>
                </li>

                <li>
                  <input
                    type="checkbox"
                    id="50kg"
                    onChange={() => {
                      const newWeight = crop.weight.includes('50kg') ? crop.weight.filter(w => w !== '50kg') : [...crop.weight, '50kg'];
                      setCrop({ ...crop, weight: newWeight });
                    }}
                  />
                  <span>50 kg</span>
                </li>

                <li>
                  <input
                    type="checkbox"
                    id="100kg"
                    onChange={() => {
                      const newWeight = crop.weight.includes('100kg') ? crop.weight.filter(w => w !== '100kg') : [...crop.weight, '100kg'];
                      setCrop({ ...crop, weight: newWeight });
                    }}
                  />
                  <span>100 kg</span>
                </li>

              </ul>
            </div>
          </div>

          
            <button
              type="submit"
              // disabled={loading || !crop.category || !crop.crop_name || !crop.description || !crop.price_per_kg || !crop.availability || !crop.image}
            >
              {loading ? 'Uploading...' : 'Upload Crop'}
            </button>
          
        </form>
       
      </div>
    </>
  );
}

export default Upload_List;
