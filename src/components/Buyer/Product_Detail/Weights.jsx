import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

function Weights({ product }) {
  const [productWeights, setProductWeights] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const { setAddedItem, setTotalQuantity, selectedQuantity, setSelectedQuantity } = useContext(AuthContext);
  const [localQuantity, setLocalQuantity] = useState({});

  // Load the saved quantities from localStorage when the component mounts
  useEffect(() => {
    if (product?.weight) {
      setProductWeights(product.weight);
      const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
      setLocalQuantity(savedQuantities[product.id] || {});

      // Initialize selectedQuantity for the current product
      const savedSelectedQuantities = JSON.parse(localStorage.getItem('selectedQuantities')) || {};
      setSelectedQuantity((prevSelectedQuantities) => ({
        ...prevSelectedQuantities,
        [product.id]: savedSelectedQuantities[product.id] || 0,
      }));

      initializeCartState(product);
    }
  }, [product]);

  const initializeCartState = (product) => {
    setAddedItem((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (!existingItem) {
        const newItem = {
          ...product,
          quantity: 0,
          weight: product.weight.map((w) => ({ ...w, quantity: 0 })),
        };
        return [...prevItems, newItem];
      }
      return prevItems;
    });
  };

  const handleWeightClick = (weight) => {
    setSelectedWeight(weight);
    setShowModal(true);
  };

  const updateQuantity = (weight, newQuantity) => {
    const updatedLocalQuantity = {
      ...localQuantity,
      [weight.weight]: newQuantity,
    };
    setLocalQuantity(updatedLocalQuantity);

    // Save quantities per product using the product's id as a key
    const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
    savedQuantities[product.id] = updatedLocalQuantity;
    localStorage.setItem("quantities", JSON.stringify(savedQuantities));

    setProductWeights((prevWeights) =>
      prevWeights.map((w) =>
        w.weight === weight.weight ? { ...w, quantity: newQuantity } : w
      )
    );

    updateCartState(weight, newQuantity);
  };

  const incrementQuantity = (weight) => {
    const newQty = Math.min(
      (localQuantity[weight.weight] || 0) + 1,
      weight.available
    );
    updateQuantity(weight, newQty);
  };

  const decrementQuantity = (weight) => {
    const newQty = Math.max((localQuantity[weight.weight] || 0) - 1, 0);
    updateQuantity(weight, newQty);
  };

  const updateCartState = (weight, newQuantity) => {
    const updatedLocalQuantity = {
      ...localQuantity,
      [weight.weight]: newQuantity,
    };

    const totalQuantity = Object.values(updatedLocalQuantity).reduce(
      (sum, q) => sum + q,
      0
    );

    // Update selectedQuantity for the current product
    setSelectedQuantity((prevSelectedQuantities) => {
      const updatedSelectedQuantities = {
        ...prevSelectedQuantities,
        [product.id]: totalQuantity,
      };
      localStorage.setItem('selectedQuantities', JSON.stringify(updatedSelectedQuantities));
      return updatedSelectedQuantities;
    });

    setAddedItem((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === product.id
          ? {
              ...item,
              weight: productWeights.map((w) => ({
                ...w,
                quantity: updatedLocalQuantity[w.weight] || 0,
              })),
              quantity: totalQuantity,
            }
          : item
      );
      localStorage.setItem("cartItem", JSON.stringify(updatedItems));
      return updatedItems;
    });

    // Update totalQuantity correctly without using stale state.
    setTotalQuantity((prevTotal) => prevTotal + totalQuantity);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="main-weight mb-3">
        <h5 className="weight-header">Weights (bags / sacks) Available</h5>
        <ul className="weight_wrapper">
          {productWeights.map((weight, index) => (
            <li
              key={weight.weight}
              className="weight"
              onClick={() => handleWeightClick(weight)}
            >
              {weight.weight}
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="custom-modal-overlay" onClick={handleCloseModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Choose Weights</h5>
              <button
                type="button"
                className="close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <div className="custom-modal-body">
              {productWeights.map((weight, index) => (
                <div key={weight.weight} className="show-weight mt-2">
                  <div className="size-cash">
                    <h4>{weight.weight}</h4>
                    <h6>UGX {product.price_per_unit}/kg</h6>
                    <span className="text-danger">
                      {weight.available - (localQuantity[weight.weight] || 0)}{" "}
                      bags left
                    </span>
                  </div>
                  <div
                    className="input-group quantity mr-3"
                    style={{ width: 180 }}
                  >
                    <button
                      className="btn btn-success btn-minus"
                      onClick={() => decrementQuantity(weight)}
                      disabled={(localQuantity[weight.weight] || 0) === 0}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control bg-secondary text-center w-80"
                      value={localQuantity[weight.weight] || 0}
                      readOnly
                    />
                    <button
                      className="btn btn-success btn-plus"
                      onClick={() => incrementQuantity(weight)}
                      disabled={
                        (localQuantity[weight.weight] || 0) === weight.available
                      }
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="d-flex align-items-center mb-4 pt-2 cart-symbols">
        <>
          <div className="input-group quantity mr-3" style={{ width: 180 }}>
            <input
              type="text"
              className="form-control bg-secondary text-center w-80"
              value={selectedQuantity[product.id] || 0}
              readOnly
            />
          </div>
          <button className="btn btn-dark">
            <i className="bi bi-cart-check-fill mr-1"></i> ({selectedQuantity[product.id] || 0} items) Added To Cart
          </button>
        </>
      </div>
    </>
  );
}

export default Weights;