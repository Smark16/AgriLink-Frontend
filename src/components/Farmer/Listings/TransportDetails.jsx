import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';

const POST_DELIVERY_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_delivery_options';
const POST_PAYMENT_URL = 'https://agrilink-backend-hjzl.onrender.com/agriLink/post_payment_method';

function TransportDetails() {
    const { user } = useContext(AuthContext);
    const LIST_PAYMENT_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/list_payment_methods/${user?.user_id}`;
    const LIST_DELIVERY_URL = `https://agrilink-backend-hjzl.onrender.com/agriLink/delivery_list/${user?.user_id}`;

    const [delivery, setDelivery] = useState({ user: user?.user_id, name: [], fee: 0, duration: "" });
    const [payment, setPayment] = useState({ user: user?.user_id, methodType: [], contact_name: "", contact_email: "", contact_phone: null });

    const [allDelivery, setAllDelivery] = useState([]);
    const [allPayment, setAllPayment] = useState([]);
    const [editpayMode, setEditpayMode] = useState(false);
    const [editdeliverMode, setEditDeliverMode] = useState(false);
    const [deliverLoader, setDeliverLoader] = useState(false)
    const [payLoader, setPayLoader] = useState(false)

    const [currentDeliver, setCurrentDeliver] = useState(null);
    const [currentMethod, setCurrentMethod] = useState(null)

    const [load, setLoad] = useState(false)

    const EDIT_PAYMENT_METHOD = `https://agrilink-backend-hjzl.onrender.com/agriLink/edit_payment`;
    const EDIT_DELIVERY_OPTION = `https://agrilink-backend-hjzl.onrender.com/agriLink/edit_delivery`;

    useEffect(() => {
        // Fetch all payments
        const fetchPayment = async () => {
            try {
                setLoad(true)
                const response = await axios.get(LIST_PAYMENT_URL);
                const { payment_method } = response.data;
                setAllPayment(payment_method);
                setLoad(false)
            } catch (err) {
                console.log('err', err);
            }
        };

        // Fetch delivery options
        const fetchdelivery = async () => {
            try {
                setLoad(true)
                const response = await axios.get(LIST_DELIVERY_URL);
                const { delivery_options } = response.data;
                setAllDelivery(delivery_options);
                setLoad(false)
            } catch (err) {
                console.log('err', err);
            }
        };

        fetchPayment();
        fetchdelivery();
    }, []);

    // Delivery and payment edit logic
    useEffect(() => {
        const currentOption = allDelivery.find(deliver => deliver.user === user?.user_id);
        const currentPay = allPayment.find(pay => pay.user === user?.user_id);
        
        setCurrentDeliver(currentOption);
        setCurrentMethod(currentPay);
        
        setEditDeliverMode(!currentOption);  // Show form if no delivery option exists
        setEditpayMode(!currentPay);         // Show form if no payment method exists
    }, [user?.user_id, allDelivery, allPayment]);

    // Populate delivery form when in edit mode
    useEffect(() => {
        if (editdeliverMode && currentDeliver) {
            setDelivery({
                user: user?.user_id,
                name: currentDeliver.name,
                fee: currentDeliver.fee,
                duration: currentDeliver.duration,
                id: currentDeliver.id // Include id for updating
            });
        }
    }, [editdeliverMode, currentDeliver, user?.user_id]);

    // Populate payment form when in edit mode
    useEffect(() => {
        if (editpayMode && currentMethod) {
            setPayment({
                user: user?.user_id,
                methodType: currentMethod.methodType,
                contact_name: currentMethod.contact_name,
                contact_email: currentMethod.contact_email,
                contact_phone: currentMethod.contact_phone,
                id: currentMethod.id // Include id for updating
            });
        }
    }, [editpayMode, currentMethod, user?.user_id]);

    // Delivery form submission
    const handleSubmit = async (e) => {
        setDeliverLoader(true)
        e.preventDefault();
        try {
            if (editdeliverMode && currentDeliver) {
                await axios.put(`${EDIT_DELIVERY_OPTION}/${currentDeliver.id}`, delivery)
                    .then(res => {
                        if(res.status === 201){
                              setDeliverLoader(false)
                        }
                        setAllDelivery(prev => prev.map(d => d.id === currentDeliver.id ? {...d, ...delivery} : d));
                        setEditDeliverMode(false);
                    })
                    .catch(err => console.log(err));
            } else {
                await axios.post(POST_DELIVERY_URL, { ...delivery, user: user?.user_id })
                    .then(res => {
                        if(res.status === 201){
                            setDeliverLoader(false)
                        }
                        setAllDelivery(prev => [...prev, res.data]);
                        setEditDeliverMode(false);
                    })
                    .catch(err => console.log(err));
            }
        } catch (err) {
            console.log('err', err)
        }
    };

    // Payment form submission
    const paySubmit = async (e) => {
        e.preventDefault();
        setPayLoader(true)
        try {
            if (editpayMode && currentMethod) {
                await axios.put(`${EDIT_PAYMENT_METHOD}/${currentMethod.id}`, payment)
                    .then(res => {
                        if(res.status === 201){
                            setPayLoader(false)
                        }
                        setAllPayment(prev => prev.map(p => p.id === currentMethod.id ? {...p, ...payment} : p));
                        setEditpayMode(false);
                    })
                    .catch(err => console.log(err));
            } else {
                await axios.post(POST_PAYMENT_URL, { ...payment, user: user?.user_id })
                    .then(res => {
                        if(res.status === 201){
                            setPayLoader(false)
                        }
                        setAllPayment(prev => [...prev, res.data]);
                        setEditpayMode(false);
                    })
                    .catch(err => console.log(err));
            }
        } catch (err) {
            console.log('err', err)
        }
    };

    return (
        <>
            <div className="more-crop-info col-lg-9">
                <h4 className='p-2 mt-2 text-center'>Delivery Options</h4>
                {allDelivery.length > 0 && !editdeliverMode ? (
                    <>
                    {load ? (
                        <div>
                        <div className='loader'></div>
                    </div>
                        ) : (<>
                        <div className="showdelivery w-100 p-2">
                            {allDelivery.map((deliver, index) => {
                                const { id, fee, duration } = deliver;
                                return (
                                    <React.Fragment key={id || index}>
                                        <div className="Deliver-name">
                                            {deliver.name.map((nm, idx) => (
                                                <div key={idx} className="del-options">
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                    <span>
                                                        {nm.includes('Door Delivery') && fee > 0
                                                            ? `Door delivery (fee UGX ${fee})`
                                                            : `Local pick :~ No Transportation (fee UGX 0.00)`}
                                                    </span>
                                                    <span>{nm.includes('Door Delivery') ? ` Duration (${duration})` : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className='ms-auto edit-deliver' onClick={() => setEditDeliverMode(true)}>Edit</span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </>)}
                        
                    </>
                ) : (
                    <>
                    {load ? (
                         <div>
                         <div className='loader'></div>
                     </div>
                        ) : (<>
                        <form className="crop-delivery-options" onSubmit={handleSubmit}>
                        <div className="options">
                            <div className="first-del-option mb-4">
                                <input
                                    type='checkbox'
                                    name='doorDelivery'
                                    checked={delivery.name.includes('Door Delivery')}
                                    onChange={(e) => {
                                        setDelivery(prevDelivery => ({
                                            ...prevDelivery,
                                            name: e.target.checked
                                                ? [...prevDelivery.name, 'Door Delivery']
                                                : prevDelivery.name.filter(item => item !== 'Door Delivery'),
                                        }));
                                    }}
                                />
                                <span>Door Delivery</span>
                            </div>

                            <div className="second-del-option mb-4">
                                <input
                                    type='checkbox'
                                    name='localPickup'
                                    checked={delivery.name.includes('Local Pickup')}
                                    onChange={(e) => {
                                        setDelivery(prevDelivery => ({
                                            ...prevDelivery,
                                            name: e.target.checked
                                                ? [...prevDelivery.name, 'Local Pickup']
                                                : prevDelivery.name.filter(item => item !== 'Local Pickup'),
                                        }));
                                    }}
                                />
                                <span>Local pick :~ No Transportation</span>
                            </div>
                        </div>

                        {delivery.name.includes('Door Delivery') && (
                            <>
                                <div className="fee mb-4">
                                    <label htmlFor="description" className="form-label">Delivery Fee</label>
                                    <input
                                        type='number'
                                        className="form-control"
                                        name='fee'
                                        value={delivery.fee}
                                        onChange={(e) => setDelivery({ ...delivery, fee: e.target.value })}
                                    />
                                </div>

                                <div className="duration mb-4">
                                    <label htmlFor="description" className="form-label">Duration of Transportation (e.g 2 days, 1 day etc)</label>
                                    <input
                                        type='text'
                                        className="form-control"
                                        name='duration'
                                        value={delivery.duration}
                                        onChange={(e) => setDelivery({ ...delivery, duration: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <button type='submit' className='btn btn-success p-2 text-white text-center w-90'>{currentDeliver ? 
                        `${deliverLoader ? 'Updating...' : 'Update'}` : 
                        `${deliverLoader ? 'Saving...' : 'Save'}`}</button>
                    </form>

                    </>)}
                    
                    </>
                  
                )}

                {/* Payment Methods */}
                <h4 className='p-2 mt-2 text-center'>Payment Methods</h4>
                {allPayment.length > 0 && !editpayMode ? (
                    <>
                    {load ? (
                        <div>
                        <div className='loader'></div>
                    </div>
                        ) : (<>
                        <div className="showdelivery w-100 p-2">
                            {allPayment.map((pay, index) => {
                                const { id, contact_email, contact_name, contact_phone} = pay;
                                return (
                                    <React.Fragment key={id || index}>
                                        <div className="Deliver-name">
                                            {pay.methodType.map((nm, idx) => (
                                                <div key={idx} className="del-options">
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                    <span>
                                                        {nm}
                                                    </span>
                                                    <span>{nm.includes('Flutter Wave') ? (<>
                                                    <br></br><span><strong>Contact Name:</strong> {contact_name}</span>
                                                    <br></br><span><strong>Personal Email:</strong> {contact_email}</span>
                                                    <br></br><span><strong>Telephone :</strong> {contact_phone}</span>
                                                    </>) : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className='ms-auto edit-deliver' onClick={() => setEditpayMode(true)}>Edit</span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </>)}
                    
                    </>
                  ) : (
                    <>
                    {load ? (
                        <div>
                            <div className='loader'></div>
                        </div>
                        ) : (<>
                        <form className="crop-payment-options col-lg-12" onSubmit={paySubmit}>
                        <div className="method-type">
                            <div className="pay-on mb-4">
                                <input
                                    type='checkbox'
                                    name='PayOnDelivery'
                                    checked={payment.methodType.includes('Pay On Delivery')}
                                    onChange={(e) => setPayment(prevPay => ({
                                        ...prevPay,
                                        methodType: e.target.checked
                                            ? [...prevPay.methodType, 'Pay On Delivery']
                                            : prevPay.methodType.filter(pay => pay !== 'Pay On Delivery'),
                                    }))}
                                />
                                <span>Pay On Delivery</span>
                            </div>

                            <div className="instant mb-4">
                                <input
                                    type='checkbox'
                                    name='FlutterWave'
                                    checked={payment.methodType.includes('Flutter Wave')}
                                    onChange={(e) => setPayment(prevPay => ({
                                        ...prevPay,
                                        methodType: e.target.checked
                                            ? [...prevPay.methodType, 'Flutter Wave']
                                            : prevPay.methodType.filter(pay => pay !== 'Flutter Wave'),
                                    }))}
                                />
                                <span>Flutter Wave</span>
                            </div>
                        </div>

                        {payment.methodType.includes('Flutter Wave') && (
                            <>
                                <div className="more-payment-info">
                                    <div className="mb-4">
                                        <label htmlFor="description" className="form-label">Contact to receive Payment</label>
                                        <input
                                            type='number'
                                            className="form-control"
                                            name='contact_phone'
                                            value={payment.contact_phone}
                                            onChange={(e) => setPayment({ ...payment, contact_phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="description" className="form-label">Contact Name</label>
                                        <input
                                            type='text'
                                            className="form-control"
                                            name='contact_name'
                                            value={payment.contact_name}
                                            onChange={(e) => setPayment({ ...payment, contact_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="description" className="form-label">Email</label>
                                        <input
                                            type='email'
                                            className="form-control"
                                            name='contact_email'
                                            value={payment.contact_email}
                                            onChange={(e) => setPayment({ ...payment, contact_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type='submit' className='btn btn-success text-white text-center p-2'>{currentMethod ? 
                        `${payLoader ? 'Updating...' : 'Update'}` : 
                        `${payLoader ? 'Saving...' : 'Save'}`}</button>
                    </form>

                    </>)}
                    </>
                   
                )}
            </div>
        </>
    );
}
export default TransportDetails;