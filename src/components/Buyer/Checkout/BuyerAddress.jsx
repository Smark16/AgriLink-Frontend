import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import Districts from '../../Farmer/FarmerInfo/Districts';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';

const POST_ADDRESS_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_user_address';
const EDIT_ACTIVE_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/edit_active/';

function BuyerAddress() {
  const { user, setActivatedAddress } = useContext(AuthContext);
  const USER_ADDRESSES_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/user_addresses/${encodeURIComponent(user.user_id)}`;
  
  const [showAddress, setShowAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    user: user?.user_id,
    district: "",
    city: "",
    contact: "",
    active: false
  });
  const [addresses, setAddresses] = useState([]);
  const [addressLoader, setAddressLoader] = useState(false);
  const [fetchLoader, setFetchLoader] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Convert district names into react-select options
  const districtOptions = Districts.map((district) => ({
    value: district,
    label: district,
  }));

  // Handle district change
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    setFormData({ ...formData, district: selectedOption ? selectedOption.value : '' });
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    setFetchLoader(true);
    try {
      const response = await axios.get(USER_ADDRESSES_URL);
      const data = response.data;
      setAddresses(data.useraddress);
      setUserName(data.get_full_name);
      // Set the currently active address if there is one
      const activeAddress = data.useraddress.find(addr => addr.active);
      if (activeAddress) {
        setSelectedAddressId(activeAddress.id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setFetchLoader(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add or Update Address
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddressLoader(true);

    try {
      const response = await axios[formData.id ? 'put' : 'post'](
        formData.id ? `https://agrilink-backend-hjzl.onrender.com/agriLink/edit_address/${formData.id}` : POST_ADDRESS_URL,
        formData
      );
      
      Swal.fire({
        title: formData.id ? 'Address Updated' : 'Address Added',
        icon: "success",
        timer: 6000,
        toast: true,
        position: 'top',
        timerProgressBar: true,
        showConfirmButton: false,
      });

      if (formData.id) {
        // Update the local state for the edited address
        setAddresses(addresses.map(addr => addr.id === formData.id ? { ...addr, ...formData } : addr));
      } else {
        // Add the new address to the local state
        setAddresses([...addresses, { ...formData, id: response.data.id }]);
      }
      // Reset form data after submission
      setFormData({ ...formData, id: null, district: "", city: "", contact: "" });
      setSelectedDistrict(null);
      setShowAddModal(false);
      setShowEditModal(false);
      await fetchAddresses(); // Refresh addresses to reflect any changes in 'active' status
    } catch (err) {
      console.error('Error adding/updating address:', err);
    } finally {
      setAddressLoader(false);
    }
  };

  // Enable Edit
  const handleEnableEdit = (address) => {
    setFormData({
      ...address,
      user: user?.user_id  // Ensure user ID is included for updates
    });
    setSelectedDistrict({ value: address.district, label: address.district });
    setShowEditModal(true);
  };

  // Handle Address Selection
  const handleAddressSelect = (event) => {
    setSelectedAddressId(parseInt(event.target.value, 10));
  };

  // Set the selected address as active
  const setActiveAddress = async () => {
    if (selectedAddressId !== null) {
      try {
        // First, deactivate all addresses
        await axios.put(EDIT_ACTIVE_URL, { active: false });
        
        // Then activate the selected one
        await axios.patch(`${EDIT_ACTIVE_URL}${selectedAddressId}`, { "active": true });

        const activeAddress = addresses.find(address => address.active === true);
        setActivatedAddress(activeAddress)
      
        // Update local state to reflect changes
        setAddresses(currentAddresses => currentAddresses.map(addr => 
          addr.id === selectedAddressId ? { ...addr, active: true } : { ...addr, active: false }
        ));

        Swal.fire({
          title: 'Default Address Updated',
          icon: "success",
          timer: 6000,
          toast: true,
          position: 'top',
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error setting active address:', err);
      }
    }
  };

  return (
    <>
      <div className="address bg-white p-2 sm-12 w-100">
        <div className={`w-100 ${showAddress ? 'user-address' : 'reduced-height'}`}>
          <div className="arleady-put">
            <i className="bi bi-check-circle-fill text-success"></i>
            <span>1.</span>
            <h3>Buyer Address</h3>
            <h6 className='ms-auto toggle-address text-success' onClick={() => setShowAddress(!showAddress)}>change</h6>
          </div>

          <div className="shipping-address">
            {fetchLoader ? (
              <h5>Loading...</h5>
            ) : addresses.length === 0 ? (
              <h5>No Addresses</h5>
            ) : (
              addresses.map(address => {
                const { id, district, city, contact, timestamp, active } = address;
                const relativeTime = moment(timestamp).fromNow();
                return (
                  <div key={id} className="names-div d-flex p-2 mt-2">
                    <input 
                      type='radio' 
                      name="address-selection" 
                      value={id}
                      checked={id === selectedAddressId}
                      onChange={handleAddressSelect}
                    />
                    <div className="given-info">
                      <h4>{userName}</h4>
                      <span>{district}, {city}</span>
                      <span>{contact}</span>
                      <span>{relativeTime}</span>
                      {active && <span> - Default</span>}
                    </div>
                    <span className='ms-auto edit-address' onClick={() => handleEnableEdit(address)}>edit</span>
                  </div>
                );
              })
            )}

            <div className="add-address d-flex mt-3">
              <i className="bi bi-plus-circle-fill text-success"></i>
              <span onClick={() => {
                setFormData({ ...formData, id: null, district: "", city: "", contact: "" });
                setShowAddModal(true);
              }}>Add Address</span>
            </div>
          </div>

          <button onClick={setActiveAddress} className='ms-auto mt-2 btn btn-success'>Select Address</button>
        </div>

        <div className="address-detail">
          <div className="person_name mt-2">
            <h5>{userName}</h5>
          </div>
            {fetchLoader ? (<h6>loading...</h6>) : (
                <div className="more-address">
                {addresses.find(addr => addr.active) ? (
                  <>
                    <span>{addresses.find(addr => addr.active).district}</span>,
                    <span>{addresses.find(addr => addr.active).city}</span> |
                    <span>+{addresses.find(addr => addr.active).contact}</span>
                  </>
                ) : (
                  <p>No default address set</p>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Add Address Modal */}
      {(showAddModal || showEditModal) && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">{showEditModal ? 'Edit Address' : 'Add Address'}</h5>
              <button type="button" className="close" onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}>
                ×
              </button>
            </div>
            <div className="custom-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="district" className="form-label">Enter District</label>
                  <Select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    options={districtOptions}
                    placeholder="Select District"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="city" className="form-label">Enter City</label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="contact" className="form-label">Enter Contact</label>
                  <PhoneInput
                    country="ug"
                    value={formData.contact}
                    onChange={(phone) => setFormData({ ...formData, contact: phone })}
                    className='form-control'
                    inputProps={{
                      name: 'contact',
                      required: true,
                      autoFocus: true
                    }}
                    containerClass="form-control p-0"
                    inputClass="w-100 border-0"
                  />
                </div>
                <button type="submit" className="btn_reset">
                  {addressLoader ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BuyerAddress;