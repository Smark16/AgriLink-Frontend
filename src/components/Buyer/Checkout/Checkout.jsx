import React, { useContext, useEffect, useState } from 'react';
import '../Checkout/checkout.css';
import { Link } from 'react-router-dom';
import BuyerAddress from './BuyerAddress';
import image from '../../images/flutterwave.jpg';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
    'Buyer Address',
    'Delivery Options',
    'Payment Options',
    'Confirm Order'
];

const POST_ORDER_DETAIL_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_order_detail';
const POST_ORDER_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_orders';
const POST_ORDER_CROPS = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_order_crops';

function Checkout() {
    const { addedItem, setAddedItem, activatedAddress, setActivatedAddress, user, socketRef} = useContext(AuthContext);
    console.log(activatedAddress)
    const navigate = useNavigate()

    const [delivery, setDelivery] = useState({});
    const [payment, setPayment] = useState({});
    const [totalAmount, setTotalAmount] = useState();
    const [totalPayment, setTotalPayment] = useState();
    const [deliverProfile, setDeliverProfile] = useState({});
    const [payProfile, setPayProfile] = useState({});
    const [loading, setLoading] = useState(false)

    // State to track selected delivery and payment options for each farmer
    const [selectedDelivery, setSelectedDelivery] = useState({});
    const [selectedPayment, setSelectedPayment] = useState({});
    
    useEffect(() => {
        const fetchDefaultAddress = async () => {
            try {
                const response = await axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/user_addresses/${encodeURIComponent(user.user_id)}`);
                const defaultAddress = response.data.useraddress.find(addr => addr.active);
                if (defaultAddress) {
                    setActivatedAddress(defaultAddress);
                }
            } catch (error) {
                console.error('Failed to fetch default address:', error);
            }
        };
        fetchDefaultAddress();
    }, [user, setActivatedAddress]);

    useEffect(() => {
        const fetchOptionsForFarmers = async () => {
            const uniqueFarmers = [...new Set(addedItem.map(item => item.user))];
            const newDelivery = { ...delivery };
            const newPayment = { ...payment };
            const newDeliverProfile = { ...deliverProfile };
            const newPayProfile = { ...payProfile };

            for (const farmerId of uniqueFarmers) {
                try {
                    const [deliveryResponse, paymentResponse] = await Promise.all([
                        axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/delivery_list/${farmerId}`),
                        axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/list_payment_methods/${farmerId}`)
                    ]);

                    newDelivery[farmerId] = deliveryResponse.data.delivery_options;
                    newDeliverProfile[farmerId] = deliveryResponse.data.profile;

                    newPayment[farmerId] = paymentResponse.data.payment_method;
                    newPayProfile[farmerId] = paymentResponse.data.profile;
                } catch (err) {
                    console.error('Error fetching options for farmer ' + farmerId + ':', err);
                }
            }

            setDelivery(newDelivery);
            setPayment(newPayment);
            setDeliverProfile(newDeliverProfile);
            setPayProfile(newPayProfile);
        };

        fetchOptionsForFarmers();
    }, [addedItem]);

    useEffect(() => {
        const calculateTotalAmount = () => {
            const cash = addedItem.reduce((sum, item) => {
                const { quantity, price_per_unit, get_discounted_price, weight } = item;
                const finalPrice = get_discounted_price > 0 ? get_discounted_price : price_per_unit;
                
                if (Array.isArray(weight) && weight.length > 0) {
                    return sum + weight.reduce((weightSum, w) => {
                        const weightValue = parseFloat(w.weight.replace('kg', '').trim());
                        return weightSum + (weightValue * w.quantity * finalPrice);
                    }, 0);
                } else {
                    return sum + (finalPrice * quantity);
                }
            }, 0);

            let totalDeliveryFee = 0;
            Object.values(delivery).forEach(options => {
                if(options.length > 0 && options[0].fee !== undefined) {
                    totalDeliveryFee += parseFloat(options[0].fee || "0");
                }
            });

            setTotalPayment((cash + totalDeliveryFee).toLocaleString());
            setTotalAmount(cash.toLocaleString());
             
        };

        calculateTotalAmount();
    }, [addedItem, delivery]);

    const handleDeliveryChange = (farmerId, deliveryName) => {
        setSelectedDelivery(prev => ({
            ...prev,
            [farmerId]: deliveryName
        }));
    };
    
    const handlePaymentChange = (farmerId, paymentType) => {
        setSelectedPayment(prev => ({
            ...prev,
            [farmerId]: paymentType
        }));
    };


// handle order submission
const handleConfirm = async () => {
    try {
        setLoading(true);

        // Group products by farmer
        const productsByFarmer = addedItem.reduce((acc, item) => {
            if (!acc[item.user]) {
                acc[item.user] = []; // Initialize array for the farmer if not exists
            }
            acc[item.user].push(item);
            return acc;
        }, {});

        // Extract crop IDs, quantities, and amounts for each farmer
        const cropIdsByFarmer = {};
        const quantitiesByFarmer = {}; // Stores quantities for each product
        const productAmountsByFarmer = {}; // Stores amounts for each product

        for (const [farmerId, farmerProducts] of Object.entries(productsByFarmer)) {
            cropIdsByFarmer[farmerId] = farmerProducts.map(product => product.id);
            quantitiesByFarmer[farmerId] = farmerProducts.map(product => ({
                id: product.id,
                quantity: product.quantity
            }));

            // Calculate the total amount for each product (price_per_unit * quantity)
            productAmountsByFarmer[farmerId] = farmerProducts.map(product => ({
                id: product.id,
                amount: (product.get_discounted_price > 0 ? product.get_discounted_price : product.price_per_unit) * product.quantity
            }));
        }

        // Store crop IDs, quantities, and amounts in sessionStorage
        sessionStorage.setItem('cropIdsByFarmer', JSON.stringify(cropIdsByFarmer));
        sessionStorage.setItem('quantitiesByFarmer', JSON.stringify(quantitiesByFarmer));
        sessionStorage.setItem('productAmountsByFarmer', JSON.stringify(productAmountsByFarmer));

        // Separating farmer amounts to be paid by buyer
        const farmerPayments = {};
        for (const [farmerId, farmerProducts] of Object.entries(productsByFarmer)) {
            let farmerTotal = farmerProducts.reduce((sum, item) => {
                const { quantity, price_per_unit, get_discounted_price, weight } = item;
                const finalPrice = get_discounted_price > 0 ? get_discounted_price : price_per_unit;

                if (Array.isArray(weight) && weight.length > 0) {
                    return sum + weight.reduce((weightSum, w) => {
                        const weightValue = parseFloat(w.weight.replace('kg', '').trim());
                        return weightSum + (weightValue * w.quantity * finalPrice);
                    }, 0);
                } else {
                    return sum + (finalPrice * quantity);
                }
            }, 0);

            // Check if Door Delivery is selected for this farmer
            const isDoorDeliverySelected = selectedDelivery[farmerId]?.includes('Door Delivery');
            let deliveryFee = 0;

            if (isDoorDeliverySelected && delivery[farmerId]?.length > 0) {
                deliveryFee = parseFloat(delivery[farmerId].find(option => option.name.includes('Door Delivery'))?.fee || "0");
            }

            farmerPayments[farmerId] = (farmerTotal + deliveryFee).toFixed(2);
        }

        // Store farmerPayments in sessionStorage or pass it via state/context to ConfirmPayment
        sessionStorage.setItem('farmerPayments', JSON.stringify(farmerPayments));

        console.log('farmer-payments', farmerPayments);
        console.log('crop-ids-by-farmer', cropIdsByFarmer);
        console.log('quantities-by-farmer', quantitiesByFarmer); // Log quantities
        console.log('product-amounts-by-farmer', productAmountsByFarmer); // Log amounts

        // Store all created order IDs
        let allOrderResponses = {};

        // Iterate through each farmer's products
        for (const [farmerId, farmerProducts] of Object.entries(productsByFarmer)) {

            // 1️⃣ Update availability for each product in this farmer's list
            await Promise.all(farmerProducts.map(async (item) => {
                const EDIT_AVAILABILITY_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/update_quantity/${item.id}`;

                let remained = 0;  // Reset for each item

                if (item.weight && item.weight.length > 0) {
                    // If product has weights, calculate new availability based on weights
                    remained = item.weight.reduce((sum, w) => sum + Math.max(w.available - w.quantity, 0), 0);
                } else {
                    // If no weights, use direct quantity
                    remained = item.availability - item.quantity;
                }

                console.log('remained availability', remained);
                await axios.patch(EDIT_AVAILABILITY_URL, { "availability": remained });
            }));

            // 2️⃣ Update product weights if applicable
            await Promise.all(farmerProducts.map(async (product) => {
                if (product.weight && product.weight.length > 0) {
                    const UPDATE_WEIGHT_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/update_weight/${product.id}`;

                    let productData = new FormData();
                    productData.append("user", product.user);
                    productData.append("specialisation", product.specialisation);
                    productData.append("crop_name", product.crop_name);
                    productData.append("description", product.description);

                    // Update weight availability
                    const updatedWeights = product.weight.map(w => ({
                        weight: w.weight,
                        quantity: 0,
                        available: Math.max(w.available - w.quantity, 0) // Ensure available doesn't go negative
                    }));
                    productData.append("weight", JSON.stringify(updatedWeights));
                    productData.append("price_per_unit", product.price_per_unit);
                    productData.append("unit", product.unit);
                    productData.append("InitialAvailability", product.InitialAvailability);
                    // Here, we update availability based on the sum of all weights' available
                    productData.append("availability", updatedWeights.reduce((sum, w) => sum + w.available, 0));

                    // Handle image upload
                    if (typeof product.image === 'string') {
                        // Replace HTTP with HTTPS in the image URL
                        const imageUrl = product.image.replace('http://', 'https://');
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        productData.append('image', blob, 'image.jpg');
                    } else {
                        productData.append('image', product.image, product.image.name || 'image.jpg');
                    }

                    await axios.put(UPDATE_WEIGHT_URL, productData);
                }
            }));

            // 3️⃣ Prepare orderCropData for the farmer's products
            const orderCropDataList = await Promise.all(farmerProducts.map(async (item) => {
                let formData = new FormData();
                formData.append('user', item.user);

                // Calculate total quantity
                const totalQuantity = item.weight.length > 0
                    ? item.weight.reduce((sum, w) => sum + parseFloat(w.weight.replace('kg', '').trim()) * w.quantity, 0) * item.quantity
                    : item.quantity;

                formData.append('quantity', totalQuantity);
                formData.append('weights', JSON.stringify(item.weight));
                formData.append('price_per_unit', item.get_discounted_price > 0 ? item.get_discounted_price : item.price_per_unit);
                formData.append('unit', item.unit);

                // Handle image upload
                if (typeof item.image === 'string') {
                    // Replace HTTP with HTTPS in the image URL
                    const imageUrl = item.image.replace('http://', 'https://');
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    formData.append('image', blob, 'image.jpg');
                } else {
                    formData.append('image', item.image, item.image.name || 'image.jpg');
                }

                formData.append('crop_name', item.crop_name);
                return formData;
            }));

            // 4️⃣ Post all order crops for this farmer
            const orderCropResponses = await Promise.all(orderCropDataList.map(formData =>
                axios.post(POST_ORDER_CROPS, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            ));

            // Extract orderCrop IDs
            const orderCropIds = orderCropResponses.map(response => response.data.id);

            // 5️⃣ Create an order for this farmer
            const orderResponse = await axios.post(POST_ORDER_URL, {
                user: user?.user_id,  // The buyer
                address: activatedAddress ? activatedAddress.id : null,
                status: "Pending",
                delivery_option: selectedDelivery[farmerId] || 'Not Selected',
                payment_method: selectedPayment[farmerId] || 'Not Selected'
            });

            sessionStorage.setItem('currentOrderID', orderResponse.data.id);

            console.log(`Order for Farmer ${farmerId}:`, orderResponse.data);

            // Store this order ID with farmer ID
            allOrderResponses[farmerId] = orderResponse.data.id;
            console.log('order_ids', allOrderResponses);

            // 6️⃣ Attach orderCropIds to this specific order
            const details = new FormData();
            details.append("order", orderResponse.data?.id);
            orderCropIds.forEach(id => details.append("crop", id));

            await axios.post(POST_ORDER_DETAIL_URL, details)
            .then(res => {
                if(res.status === 201){
                   if(selectedPayment[farmerId] === 'Flutter Wave'){
                    // navigate('/Buyer/confirm-payment')
                    sessionStorage.setItem('allOrderResponses', JSON.stringify(allOrderResponses));
                    navigate('/Buyer/confirm-payment', { state: { farmerPayments, cropIdsByFarmer, quantitiesByFarmer, productAmountsByFarmer }});
                   }

                   if(selectedPayment[farmerId] === 'Pay On Delivery'){
                    navigate('/Buyer/dashboard')
                    Swal.fire({
                        title: 'Order Confirmed',
                        icon: "success",
                        timer: 2000,
                      });
                   }
                   setLoading(false);
                   
                   for(let item of addedItem){
                    if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
                        socketRef.current.send(JSON.stringify({
                            action:'purchase',
                            crop: item.id
                        }))
                   }
                   }
            
                }
            }).catch(err => {
                console.log(err);
                setLoading(false); // Ensure loading state is turned off even if there's an error
            });
        }

        // ✅ All orders created successfully, clear cart
        setAddedItem([]);
        localStorage.removeItem('cartItem');
        localStorage.removeItem('quantities')
        localStorage.removeItem('selectedQuantities')

    } catch (err) {
        console.log('Error:', err);
        setLoading(false); // Ensure to turn off loading state on errors
    }
};

    return (
        <>
            <div className="container-fluid pt-2">
                <div className="place-order col-lg-12 mt-2 bg-white p-2">
                    <div className="conf d-flex">
                        <h4 className='text-success'>Confirm Order</h4>   
                        <Link to='/Buyer/all_farmers' className='ms-auto'>continue shopping</Link>
                    </div>
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

                <div className="row px-xl-5 checkout-wrapper mt-4 p-2">
                    <div className="col-lg-8 sm-12 mb-5 user-info-div">
                        <BuyerAddress/>

                        <div className="delivery bg-white p-2 mt-3">
                            <div className="user-delivery w-100">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span>2.</span>
                                <h3>Delivery Options</h3>
                                <h6 className='ms-auto'>change</h6>
                            </div>
                            
                            {/* Delivery Options */}
                            <div className="delivery-detail w-100">
                                {Object.keys(delivery).map((farmerId) => (
                                    <div key={farmerId} className="delivery-service-options">
                                        <h6 className='mt-2 text-warning'><strong>Farm:</strong> {deliverProfile[farmerId]?.farmName}</h6>
                                        {delivery[farmerId].map((option) => {
                                            const { id, fee, duration, name } = option;
                                            return (
                                                <div key={id}>
                                                    {name?.map((deliver) => (
                                                        <div className="door-delivery p-2 mt-2" key={deliver}>
                                                            <input 
                                                                type="radio" 
                                                                name={`delivery-${farmerId}`} 
                                                                checked={selectedDelivery[farmerId] === deliver}
                                                                onChange={() => handleDeliveryChange(farmerId, deliver)}
                                                            />
                                                            <div className="door-text">
                                                                <span>
                                                                    {deliver.includes("Door Delivery")
                                                                        ? `Door Delivery (UGX ${fee}) (duration: ${duration})`
                                                                        : "Local Pickup"}
                                                                </span>
                                                                <p>
                                                                    {deliver.includes("Door Delivery")
                                                                        ? "Let your ordered products reach you when you need them"
                                                                        : "Come and pick your products from our place (farm)"}
                                                                </p>
                                                            </div>
                                                            <i className="bi bi-truck-front-fill ms-auto text-success"></i>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="payment bg-white mt-3">
                            <div className="method d-flex g-3 align-items-center w-100 p-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span>3.</span>
                                <h3>Payment Methods Available</h3>
                            </div>

                            <div className="choose p-2">
                                {Object.keys(payment).map(farmerId => (
                                    <div key={farmerId} className='pay-service-options'>
                                        <h6 className='mt-1 text-warning'><strong>Farm:</strong> {payProfile[farmerId]?.farmName}</h6>
                                        {payment[farmerId].map(pay =>{
                                            const {id} = pay;
                                            return (
                                                pay.methodType.map((type, typeIndex) => (
                                                    // start
                                                    <div className="choose_wrapperr">
                                                       <div key={`${id}-${typeIndex}`} className="choose-pay p-2 mt-2">
                                                    <input 
                                                        type='radio' 
                                                        name={`payment-${farmerId}`} 
                                                        checked={selectedPayment[farmerId] === type}
                                                        onChange={() => handlePaymentChange(farmerId, type)}
                                                    />
                                                    <div className="pay-delivery">
                                                        <span>{type}</span>
                                                        <p>{type.includes('Pay On Delivery') ? 'Pay for your products as long as they reach your door' : 'Pay instantly for your products with Flutter Wave'}</p>
                                                    </div>
                                                    {type.includes('Pay On Delivery') ? 
                                                        (<i className="bi bi-truck-flatbed ms-auto text-success"></i>) : 
                                                        (<img src={image} alt='Flutter Wave' className='ms-auto flutter'></img>)
                                                    }
                                                
                                                </div>

                                                {/* choose mobile options */}
                                                {/* {selectedPayment[farmerId] === type && type === 'Flutter Wave' && (
                                                        <ul className='choose-list'>
                                                            <li>
                                                                <h6 className='text-black'>Airtel</h6>
                                                                <span>Pay bills through Airtel money</span>
                                                            </li>
                                                            <li>
                                                                <h6 className='text-black'>MTN</h6>
                                                                <span>Pay bills through MTN money</span>
                                                            </li>

                                                            <li>
                                                                <button className='btn btn-success' onClick={savePaymentDetails}>Pay Now</button>
                                                            </li>
                                                        </ul>
                                                        
                                                    )} */}
                                                    </div>
                                                   
                                                    // end
                                                ))
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 mb-5">
                        <div className="cart-items-summary bg-white p-2 card border-secondary mb-5">
                            <h5 className='summary-header p-2'>Order summary</h5>
                            <ul>
                                <li>
                                    <span>Item's total</span>
                                    <h6>UGX {totalAmount}</h6>
                                </li>

                                <li>
                                    <span>Delivery fees</span>
                                    <h6>{Object.values(delivery).reduce((sum, options) => sum + parseFloat(options[0]?.fee || "0"), 0).toFixed(2)}</h6>
                                </li>
                            </ul>

                            <div className="order-total w-100 mt-2 p-2">
                                <h5>Total</h5>
                                <span>UGX {totalPayment}</span>
                            </div>

                            <button className='p-2 w-100 mt-3' type='submit' onClick={handleConfirm}>
                               {loading ? 'Confirming...' : 'Confirm Order'}
                                </button>
                        </div>
                        <p className='text-center ms-auto'>By accepting, you are automatically accepting the <br></br><Link>Terms & conditions</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Checkout;