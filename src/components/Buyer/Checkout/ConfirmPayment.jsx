import React, { useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext'
import airtel from '../../images/airtel.jpeg'
import mtn from '../../images/mtn.jpeg'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; // for styling

import axios from 'axios'


function ConfirmPayment() {
    const {user, performanceRef, redirectLink, setRedirectLink} = useContext(AuthContext)
    const location = useLocation();
    const farmerPayments = location.state?.farmerPayments || JSON.parse(sessionStorage.getItem('farmerPayments') || '{}');
    const cropIdsByFarmer = location.state?.cropIdsByFarmer || JSON.parse(sessionStorage.getItem('cropIdsByFarmer') || '{}');
    const quantitiesByFarmer = location.state?.quantitiesByFarmer || JSON.parse(sessionStorage.getItem('quantitiesByFarmer') || '{}')
    const productAmountsByFarmer = location.state?.productAmountsByFarmer || JSON.parse(sessionStorage.getItem('productAmountsByFarmer') || '{}')
    const allOrderIds = JSON.parse(sessionStorage.getItem('allOrderResponses') || '{}'); // Now an object with farmerId as key
    const [fullname, setFullName]  = useState('')
    const [operator, setOperator] = useState('')
    const [orderID, setOrderID] = useState(null)
    const [phonenumber, setPhoneNumber] = useState(null)
    const [loading, setLoading] = useState(false)

    // Dynamically calculate the total payment
    const totalPayment = Object.values(farmerPayments).reduce((sum, amount) => sum + parseFloat(amount), 0);

    useEffect(() => {
        const storedOrderID = sessionStorage.getItem('currentOrderID');
        if (storedOrderID) {
            setOrderID(storedOrderID);
        }
    }, [user]);

    console.log(orderID)
    useEffect(() => {
        const fetchDefaultAddress = async () => {
            try {
                const response = await axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/user_addresses/${encodeURIComponent(user.user_id)}`);
                const {get_full_name} = response.data
                setFullName(get_full_name)
            } catch (error) {
                console.error('Failed to fetch default address:', error);
            }
        };
        fetchDefaultAddress();
    }, [user]);

    // handle select
    const handleChange = (e)=>{
        let selected = e.target.value
        setOperator(selected)
    }

// Update savePaymentDetails to handle multiple farmers
const savePaymentDetails = () => {
    setLoading(true);
  
    // Use individual farmer payment amounts
    for (const [farmerId, amount] of Object.entries(farmerPayments)) {
      const orderId = allOrderIds[farmerId]; // Direct link to order ID per farmer
      const cropId = cropIdsByFarmer[farmerId];
      const quantities = quantitiesByFarmer[farmerId];
      const Productamount = productAmountsByFarmer[farmerId];
  
      // Prepare WebSocket message
      const updateData = {
        amount: Productamount, // Use the amount for each farmer
        email: user?.email,
        phone_number: phonenumber,
        fullname: fullname,
        tx_ref: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        order: orderId,
        network: operator,
        crop: cropId,
        quantity: quantities,
      };
  
      // Send WebSocket message for real-time updates
      if (performanceRef.current && performanceRef.current.readyState === WebSocket.OPEN) {
        performanceRef.current.send(JSON.stringify(updateData));
        console.log('Update data sent to WebSocket:', updateData);
  
        // Listen for WebSocket response
        performanceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
  
            // Check if the response contains a redirect link
            if (data.res?.charge_response?.status === 'success' && data.res.charge_response.data?.link) {
              setRedirectLink(data.res.charge_response.data.link);
              setLoading(false);
  
              // Redirect the user to the payment link
              window.location.replace(data.res.charge_response.data.link);
            } else {
              console.error('Payment initiation failed for farmer:', data);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            setLoading(false);
          }
        };
      } else {
        console.error('WebSocket connection is not open.');
        setLoading(false);
        return;
      }
    }
  };

  return (
    <div className="container-fluid justify-content-center">
        <div className="row justify-content-center pay-row">
            <div className="col-lg-10">
                <h4 className='text-muted'>Order Summary</h4>
                <div className="total d-flex p-3 bg-white rounded">
                    <h5>Total</h5>
                <span className='ms-auto'>UGX {totalPayment}</span>
                </div>

                <h4 className='mt-3 text-muted'>Payment Method</h4>
                <div className="mobile-pay bg-white p-2">
                    <div className="mobile d-flex">
                        <h6>Mobile Money</h6>
                        <div className="operator ms-auto d-flex">
                            <img src={airtel} alt='airtel'></img>
                            <img src={mtn} alt='mtn'></img>
                        </div>
                    </div>

                    <FormControl variant="standard" sx={{ m: 1, width:'95%' }}>
        <InputLabel id="demo-simple-select-standard-label">select Operator</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="Choose Operator (mtn, airtel)"
          value={operator || ''}  
          onChange={handleChange}
        >
          
          <MenuItem value='AIRTEL' className='text-success'>Airtel</MenuItem>
          <MenuItem value='MTN' className='text-success'>MTN</MenuItem>
        </Select>
      </FormControl>

      <div className="mb-4 mt-2">
        <span className='text-warning'>Note: Enter Phone number without '0' e.g 75xxxxxxxxxxxxxxxxx</span>
        <PhoneInput
  country={'ug'}
  containerClass="w-100" 
  inputClass="w-100" 
  value={phonenumber}
  onChange={(value) => setPhoneNumber(value)} 
  inputProps={{
    placeholder: "Enter phone number without 0 e.g 256 75xxxxxx",
    required: true,
  }}
/>
</div>
         <button className='btn btn-success' onClick={savePaymentDetails}>
            {loading ? 'Intiating...' : 'Pay now'}
            </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ConfirmPayment
