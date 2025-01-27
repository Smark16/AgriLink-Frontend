import React, { useContext, useEffect } from 'react';
import '../Checkout/checkout.css';
import { Link } from 'react-router-dom';
import BuyerAddress from './BuyerAddress';
import image from '../../images/flutterwave.jpg';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';

const POST_ORDER_DETAIL_URL = 'http://127.0.0.1:8000/agriLink/post_order_detail';
const POST_ORDER_URL = 'http://127.0.0.1:8000/agriLink/post_orders';
const POST_ORDER_CROPS = 'http://127.0.0.1:8000/agriLink/post_order_crops';

function Checkout() {
    const { addedItem, setAddedItem, activatedAddress, setActivatedAddress, user } = useContext(AuthContext);
      console.log(activatedAddress)
    useEffect(() => {
        // If there's no activated address, fetch the default one if it exists
            const fetchDefaultAddress = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/agriLink/user_addresses/${encodeURIComponent(user.user_id)}`);
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

    const handleConfirm = async () => {
        try {
            // Update availability for each item
            for (let item of addedItem) {
                const EDIT_AVAILABILITY_URL = `http://127.0.0.1:8000/agriLink/update_quantity/${item.id}`;
                const remained = item.availability=== 0 ? item.InitialAvailability - item.quantity : item.availability - item.quantity
                // console.log(remained);
                await axios.patch(EDIT_AVAILABILITY_URL, { "availability": remained });
            }

            // Update products focusing on weight for those with weights
            for (let product of addedItem) {
                let productData = new FormData()
                if (product.weight && product.weight.length > 0) {
                    const UPDATE_WEIGHT_URL = `http://127.0.0.1:8000/agriLink/update_weight/${product.id}`;

                    productData.append("user", product.user)
                    productData.append("specialisation", product.specialisation)
                    productData.append("crop_name", product.crop_name)
                    productData.append("description", product.description)
                    
                    // Create a new weight array where quantity is reset to 0 and availability is updated
                    const updatedWeights = product.weight.map(w => ({
                        weight: w.weight,
                        quantity: 0, // Reset quantity to 0
                        available: w.available - w.quantity // Update availability
                    }));
                    productData.append("weight", JSON.stringify(updatedWeights))
                    productData.append("price_per_unit", product.price_per_unit)
                    productData.append("unit", product.unit)
                    productData.append("InitialAvailability", product.InitialAvailability)
                    productData.append("availability", product.availability)
                    productData.append("quantity", 0)
                      
                     // Handle image upload
                if (typeof image === 'string') {
                    const response = await fetch(product.image);
                    const blob = await response.blob();
                    productData.append('image', blob, 'image.jpg'); // Filename can be dynamic based on original filename if available
                } else {
                    productData.append('image', image, image.name || 'image.jpg');
                }
                      
                await axios.put(UPDATE_WEIGHT_URL, productData)
                .then(res =>{
                    console.log('product weight', res.data)
                }).catch(err =>{
                    console.log('err', err)
                })
                
                }
            }
            // Prepare orderCropData for all items
            const orderCropDataList = await Promise.all(addedItem.map(async item => {
                const { user, quantity, weight, price_per_unit, unit, image, crop_name, get_discounted_price } = item;
                
                let formData = new FormData();
                formData.append('user', user);
                
               // Calculate overall quantity if product has weights
                const totalQuantity = weight.length > 0 ? 
                weight.reduce((sum, w) => {
                const usedWeight = w.quantity > 0 ? parseFloat(w.weight.replace('kg', '').trim()) : 0;
                return sum + usedWeight * w.quantity;
                }, 0) * quantity
                : quantity;

                // console.log('total quantity', totalQuantity)

                formData.append('quantity', totalQuantity);
                formData.append('weights', JSON.stringify(weight)); // Assuming weight is an array or object
                formData.append('price_per_unit', get_discounted_price > 0 ? get_discounted_price : price_per_unit);
                formData.append('unit', unit);
                
                // Handle image upload
                if (typeof image === 'string') {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    formData.append('image', blob, 'image.jpg'); // Filename can be dynamic based on original filename if available
                } else {
                    formData.append('image', image, image.name || 'image.jpg');
                }

                formData.append('crop_name', crop_name);

                return formData;
            }));

            // Post all order crops at once
            const orderCropResponses = await Promise.all(orderCropDataList.map(formData => 
                axios.post(POST_ORDER_CROPS, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            ));

            // console.log('Order crops posted:', orderCropResponses);

            // Extract IDs from the responses
            const orderCropIds = orderCropResponses.map(response => response.data.id);

            // Post order
            const orderResponse = await axios.post(POST_ORDER_URL, {
                user: user?.user_id,
                address: activatedAddress ? activatedAddress.id : null,
                status: "Pending"
            });

            // console.log('order', orderResponse);

            // Post order detail with orderCropIds
            const details = new FormData();
            details.append("order", orderResponse.data?.id);
            
            // Attach orderCropIds to the FormData for ManyToMany association
            orderCropIds.forEach(id => details.append("crop", id));

            const detailResponse = await axios.post(POST_ORDER_DETAIL_URL, details);
            // console.log('detail', detailResponse);

            // Clear cart
            setAddedItem([]);
            localStorage.removeItem('cartItem'); // Assuming 'cartItem' is the key used in localStorage

        } catch (err) {
            console.log('error', err);
        }
    };

    return (
        <>
            <div className="place-order col-lg-12 d-flex align-items-center mt-2 bg-white p-2">
                <h4>Confirm Order</h4>    
                <Link className='ms-auto'><i className="bi bi-skip-backward-fill text-success"></i> continue shopping</Link>
            </div>
            <div className="container-fluid">

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

                            <div className="delivery-detail w-100">
                                <div className="door-delivery p-2 mt-2">
                                    <input type='radio' name='delivery'/>
                                    <div className="door-text">
                                        <span>Door Delivery</span>
                                        <p>Let your ordered products reach you when you need them</p>
                                    </div>
                                    <i className="bi bi-truck-front-fill ms-auto text-success"></i>
                                </div>

                                <div className="local-pick-up p-2 mt-2">
                                    <input type='radio' name='delivery'/>
                                    <div className="local-text">
                                        <span>Local Pick Up</span>
                                        <p>Come and pick your products from our place (farm)</p>
                                    </div>
                                    <i className="bi bi-truck-front-fill ms-auto text-success"></i>
                                </div>
                            </div>
                        </div>

                        <div className="payment bg-white mt-3">
                            <div className="method d-flex g-3 align-items-center w-100 p-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span>3.</span>
                                <h3>Payment Methods Available</h3>
                            </div>

                            <div className="choose p-2">
                                <div className="choose-pay p-2 mt-2">
                                    <input type='radio' name='payment'/>
                                    <div className="pay-delivery">
                                        <span>Pay on delivery</span>
                                        <p>Pay for your products as long as they reach your door</p>
                                    </div>
                                    <i className="bi bi-truck-flatbed ms-auto text-success"></i>
                                </div>

                                <div className="choose-instant p-2 mt-2">
                                    <input type='radio' name='payment'/>
                                    <div className="flutter">
                                        <span>Flutter wave</span>
                                        <p>Pay instantly for your products with flutter wave</p>
                                    </div>
                                    <img src={image} alt='flutter' className='ms-auto'></img>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 sm-12 cart-items-summary bg-white p-2 card border-secondary mb-5">
                        <h5 className='summary-header p-2'>Order summary</h5>
                        <ul>
                            <li>
                                <span>Item's total</span>
                                <h6>UGX 1,438,188</h6>
                            </li>

                            <li>
                                <span>Delivery fees</span>
                                <h6>UGX 1,438,188</h6>
                            </li>
                        </ul>

                        <div className="order-total w-100 mt-2 p-2">
                            <h5>Total</h5>
                            <span>UGX 34,600</span>
                        </div>

                        <button className='p-2 w-100 mt-3' type='submit' onClick={handleConfirm}>Confirm Order</button>

                    </div>
                </div>
            </div>
            <p className='text-center ms-auto'>By accepting, you are automatically accepting the <br></br><Link>Terms & conditions</Link></p>
        </>
    );
}

export default Checkout;