import React, { useState } from "react";
import "../Authenticate/Auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import farmer from "../images/signupImage.jpeg";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const farmerRegister = "https://agrilink-backend-hjzl.onrender.com/agriLink/farmer_register";
const buyerRegister = "https://agrilink-backend-hjzl.onrender.com/agriLink/buyer_register";

function Signup() {
  const navigate = useNavigate()
  const [role, setRole] = useState("buyer"); // Role selection state
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    contact: "",
    co_operativeID: "", // Only relevant for farmers
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle role selection
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({
      FullName: "",
      Email: "",
      contact: "",
      co_operativeID: "",
      password: "",
      confirm_password: "",
    });
    setError("");
    setSuccess("");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    // Validate Full Name
    if (formData.FullName.trim().split(" ").length < 2) {
      setError("Please enter your full name, including both first and last name.");
      return;
    }
  
    // Validate Password Match
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }
  
    const endpoint = role === "buyer" ? buyerRegister : farmerRegister;
  
    const payload = role === "buyer" 
      ? { ...formData, is_buyer: true } 
      : { ...formData, is_farmer: true };
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setSuccess("Registration successful! Please log in.");
        setFormData({
          FullName: "",
          Email: "",
          contact: "",
          co_operativeID: "",
          password: "",
          confirm_password: "",
        });
        setLoading(false)
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.detail || "An error occurred during registration.");
      }
    } catch (err) {
      setError("Failed to register. Please try again later.");
    }

  };

  return (
    <>
      <div className="main">
        <div className="welcome">
          <img src={farmer} alt="signup" />
        </div>

        <div className="signup">
          <div className="choose">
            <h5>Sign Up to Create Account</h5>
            <span>Register as</span>

            <div className="roles">
              <ul>
                <li>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === "buyer"}
                    onChange={handleRoleChange}
                  />
                  <span>Buyer</span>
                </li>
                <li>
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={role === "farmer"}
                    onChange={handleRoleChange}
                  />
                  <span>Farmer</span>
                </li>
              </ul>
            </div>

            <p>Continue with Sign Up</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="FullName" className="form-label">
                Enter Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="FullName"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                placeholder="Enter Name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Enter Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="Enter Email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="contact" className="form-label">
                Enter Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Enter Contact"
                required
              />
            </div>

            {role === "farmer" && (
              <div className="mb-3">
                <label htmlFor="co_operativeID" className="form-label">
                  Enter Cooperative ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="co_operativeID"
                  name="co_operativeID"
                  value={formData.co_operativeID}
                  onChange={handleInputChange}
                  placeholder="Enter Cooperative ID"
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Choose Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirm_password" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
              />
            </div>

            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}

            <button type="submit" className="btn btn-primary">
            {loading ? 'Signing...' : 'Sign up'}
            </button>

            <p>
              Already Have an Account?{" "}
              <Link to="/login" className="text-success">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;
