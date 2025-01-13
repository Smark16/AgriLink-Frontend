import React, { useState, useEffect, useContext } from 'react';
import '../Listings/Listings.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const all_categories_url = 'http://127.0.0.1:8000/agriLink/all_categories';

function EditCrop() {
  const {id} = useParams()
  const edit_crops_url = `http://127.0.0.1:8000/agriLink/update_farmer_crop/${id}`
  const detail_url = `http://127.0.0.1:8000/agriLink/crop_detail/${id}`
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
    image:null
  });
  
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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

   // fecth detail
   const fetch_crop_detail = async()=>{
    try{
    const response = await axios.get(detail_url)
    const data = response.data
    setPreviewImage(data.image);
    console.log(data)
    setCrop(data)
    }catch(err){
        console.log('an error occured')
    }
}
useEffect(() => {
    fetch_categories();
    fetch_crop_detail()
}, []);

// Handle file selection via drag-and-drop or browse
  const handleImageChange = (e) => {
      const selectedImage = e.target.files[0] 
      if (selectedImage) {
        setCrop({ ...crop, image: selectedImage }); // Update image as a file
        setPreviewImage(URL.createObjectURL(selectedImage)); // Update the preview URL
      }
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
    
    // Append the entire weight array as a JSON string
    formData.append('weight', JSON.stringify(crop.weight));

    if (crop.image instanceof File) {
        formData.append('image', crop.image);
    } else if (typeof crop.image === 'string') {
        try {
            // Download the image from the URL
            const imageResponse = await axios.get(crop.image, { responseType: 'blob' });
            const imageBlob = new Blob([imageResponse.data], { type: imageResponse.headers['content-type'] });
            const imageFile = new File([imageBlob], 'image.png');
            formData.append('image', imageFile);
        } catch (err) {
            setLoading(false);
            console.log(err);
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
        console.log(err);
        showErrorAlert('An error occurred while updating the crop. Please try again.');
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
      <h4>EDIT CROP</h4>
      <div className="crop_upload bg-white p-2">
        <form className='row g-3 mt-3 p-2' onSubmit={handleSubmit}>
          <div className="image_bordering">
            <label htmlFor='image' className='text-primary text-decoration-underline upload_label form-label'>Choose Image to Upload</label>
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              id="image"
              className="form-control"
              hidden='true'
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

          <div className="col-md-6 sm-12">
            <label className="form-label">Enter the available weights (sizes) for your product</label>
            <div className="weights edit_weight">
<ul>
  {['5kg', '10kg', '50kg', '100kg'].map((weight) => (
    <li key={weight}>
      <input
        type="checkbox"
        id={weight}
        checked={crop.weight.includes(weight)} // Ensure state reflects the selected values
        onChange={() => {
          const newWeight = crop.weight.includes(weight)
            ? crop.weight.filter((w) => w !== weight)
            : [...crop.weight, weight];
          setCrop({ ...crop, weight: newWeight });
        }}
      />
      <span>{weight}</span>
    </li>
  ))}
</ul>
            </div>
          </div>

          
            <button
              type="submit"
            >
              {loading ? 'Updating...' : 'Update Crop'}
            </button>
          
        </form>
       
      </div>
    </>
  );
}

export default EditCrop;
