import React, { useContext, useState, useEffect } from 'react';
import '../Cart/cart.css';
import { AuthContext } from '../../Context/AuthContext';
import image from '../../images/cart_image.png'
import { Link } from 'react-router-dom';

function Cart() {
  const { addedItem, setAddedItem, setTotalQuantity, incrementQuantity, decrementQuantity,  IncrementWeightQuantity,
    decrementWeightQuantity} = useContext(AuthContext);
  const [totalAmount, setTotalAmount] = useState()

   // Use useEffect to compute total amount when addedItem changes
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

      setTotalAmount(cash.toLocaleString()); // Now cash is definitely a number
    };

    calculateTotalAmount();
  }, [addedItem]);

  // handle delete
  const handleDelete = (id) => {
    const deleted = addedItem.filter(item => item.id !== id);
    localStorage.setItem('cartItem', JSON.stringify(deleted));
    setAddedItem(deleted);
  }

  const handleWeightDelete = (id, weightIndex) => {
    console.log(id, weightIndex);
    
    const updatedItems = addedItem.map((item) => {
      if (item.id === id) {
        const updatedWeights = item.weight.filter((_, index) => index !== weightIndex);
        const newQuantity = updatedWeights.reduce((sum, w) => sum + w.quantity, 0); // Sum up remaining quantities

        if (updatedWeights.length === 0) {
          // Remove the product entirely if all weights are deleted
          return null; // This effectively removes the item from the array
        }

        return { ...item, weight: updatedWeights, quantity: newQuantity };
      }
      return item;
    }).filter(item => item !== null); // Filter out the null items

    // Calculate the new total quantity based on updated items
    const totalCartQuantity = updatedItems.reduce((acc, item) => {
      if (item.weight && item.weight.length > 0) {
        return acc + item.quantity; // Use the updated quantity from the item
      }
      return acc + (item.quantity || 0); // Sum up main quantity if no weight array
    }, 0);

    // Update the cart badge count
    setTotalQuantity(totalCartQuantity);

    // Save updated items to localStorage and update state
    localStorage.setItem('cartItem', JSON.stringify(updatedItems));
    setAddedItem(updatedItems);
  };

  return (
    <>
      {/* Cart Start */}
      {addedItem.length === 0 ? (
       <div className="cart_zero">
        <img src={image} alt='no item'></img>
        <h5>You don't have any Items</h5>
        <span className='text-center'>Here you will be able to see all the items that <br></br>you select</span>
       </div>
      ) : (
        <div className="container-fluid pt-5">
          <div className="row px-xl-5">
            <div className="col-lg-8 table-responsive mb-5">
              <table className="table table-bordered text-center mb-0">
                <thead className="bg-secondary text-dark">
                  <tr>
                    <th>Products</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {addedItem
                    .filter((item) => {
                      if (item.weight && item.weight.length > 0) {
                        return item.weight.some((w) => w.quantity > 0);
                      }
                      return item.quantity > 0; // Main quantity check for items without weight array
                    })
                    .map((item, index) => {
                      const { id, image, crop_name, price_per_unit, weight, quantity, get_discounted_price, unit, availability
                      } = item;
                      const finalPrice = get_discounted_price > 0 ? get_discounted_price : price_per_unit;
  
                      if (weight && weight.length > 0) {
                        // Handle items with weight array
                        return weight
                          .filter((w) => w.quantity > 0) // Only include weights with quantity > 0
                          .map((w, weightIndex) => {
                            const weightValue = parseFloat(w.weight.replace('kg', '').trim());
                            const totalPrice = finalPrice * weightValue * w.quantity;
  
                            return (
                              <tr key={`${index}-${weightIndex}`}>
                                <td className="align-middle">
                                  <img src={`https://res.cloudinary.com/dnsx36nia/${image}`} alt="" style={{ width: 50 }} />{' '}
                                  {crop_name}
                                </td>
                                <td className="align-middle">
                                  UGX {finalPrice} / {weightValue}kg
                                </td>
                                <td className="align-middle">
                                  <div className="input-group quantity mx-auto" style={{ width: 120 }}>
                                    <div className="input-group-btn">
                                      <button className="btn btn-sm btn-success btn-minus">
                                        <i className="bi bi-dash" onClick={()=>decrementWeightQuantity(item, weightIndex)}></i>
                                      </button>
                                    </div>
                                    <input 
                                      type="text" 
                                      className="form-control form-control-sm bg-secondary text-center w-80" 
                                      value={w.quantity} 
                                      readOnly 
                                    />
                                    <div className="input-group-btn">
                                      <button 
                                      className="btn btn-sm btn-primary btn-plus"
                                      disabled={w.available === w.quantity}>
                                        <i className="bi bi-plus" onClick={()=>IncrementWeightQuantity(item, weightIndex)}></i>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="align-middle">UGX {totalPrice}</td>
                                <td className="align-middle">
                                  <button className="btn btn-sm btn-danger" onClick={() => handleWeightDelete(id, weightIndex)}>
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                      } else {
                        // Handle items without weight array
                        const totalPrice = finalPrice * quantity;
  
                        return (
                          <tr key={index}>
                            <td className="align-middle">
                              <img src={`https://res.cloudinary.com/dnsx36nia/${image}`} alt="" style={{ width: 50 }} />{' '}
                              {crop_name}
                            </td>
                            <td className="align-middle">
                              UGX {finalPrice} / {unit === 'Poultry' ? 'Bird' : unit === 'Livestock' ? 'Animal' : unit === 'Produce' ? 'Fruit' : unit}
                            </td>
                            <td className="align-middle">
                              <div className="input-group quantity mx-auto" style={{ width: 120 }}>
                                <div className="input-group-btn">
                                  <button className="btn btn-sm btn-success btn-minus">
                                    <i className="bi bi-dash" onClick={()=>decrementQuantity(item)}></i>
                                  </button>
                                </div>
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm bg-secondary text-center w-80" 
                                  value={quantity} 
                                  readOnly 
                                />
                                <div className="input-group-btn">
                                  <button className="btn btn-sm btn-primary btn-plus"
                                  disabled={quantity === availability}>
                                    <i className="bi bi-plus" onClick={()=>incrementQuantity(item)}></i>
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="align-middle">UGX {totalPrice}</td>
                            <td className="align-middle">
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(id)}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </table>
            </div>
            <div className="col-lg-4">
              <div className="card border-secondary mb-5">
                <div className="card-header border-0 text-center text-white">
                  <h4 className="font-weight-semi-bold m-0">Cart Summary</h4>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3 pt-1">
                    <h6 className="font-weight-medium">Selected Items</h6>
                    <h6 className="font-weight-medium">({addedItem.length} items)</h6>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h6 className="font-weight-medium">Total</h6>
                    <h6 className="font-weight-medium">UGX {totalAmount}</h6>
                  </div>
                </div>
                <div className="card-footer border-secondary bg-transparent">
                  <Link to='/buyer/checkout' className='text-decoration-none'>
                  <button className="btn btn-block btn-success my-3 py-3">
                    Proceed To Checkout (UGX {totalAmount})
                  </button>
                  </Link>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;