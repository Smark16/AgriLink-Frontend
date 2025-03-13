import React, { useState } from "react";
import "../Authenticate/Auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import farmer from "../images/agritea.webp";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

import Swal from "sweetalert2";

const farmerRegister = "https://agrilink-backend-hjzl.onrender.com/agriLink/farmer_register";
const buyerRegister = "https://agrilink-backend-hjzl.onrender.com/agriLink/buyer_register";

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer"); // Role selection state
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    contact: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [userNameErrror, setUserNameError] = useState('')
  const [passwordError, setPasswordError] = useState([])

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
      password: "",
      confirm_password: "",
    });
    setError("");
    setSuccess("");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate Full Name
    if (formData.FullName.trim().split(" ").length < 2) {
      setError("Please enter your full name, including both first and last name.");
      setLoading(false);
      return;
    }

    
    // Validate Phone Number
    if (!formData.contact || formData.contact.length < 10) {
      setError("Please enter a valid phone number.");
      setLoading(false);
    }

    const endpoint = role === "buyer" ? buyerRegister : farmerRegister;

    const payload = {
      ...formData,
      is_buyer: role === "buyer",
      is_farmer: role === "farmer",
    };

    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setSuccess("Registration successful! Please log in.");
        setFormData({
          FullName: "",
          Email: "",
          contact: "",
          password: "",
          confirm_password: "",
        });
        setLoading(false);
        Swal.fire({
              title: 'Registration successfull',
              icon: "success",
              timer: 6000,
              toast: true,
              position: 'top',
              timerProgressBar: true,
              showConfirmButton: false,
            });
        navigate("/login");
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
       
        // console.log(err.response.data.contact)
        setUserNameError(err.response.data.contact)
        setPasswordError(err.response.data.password)
      } else {
        setError("Failed to register. Please try again later.");
      }
      console.log("err", err);
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
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="contact" className="form-label">
                Enter Phone Number
              </label>
              <PhoneInput
                country="ug"
                value={formData.contact}
                onChange={(phone) => setFormData({ ...formData, contact: phone })}
                className="form-control"
                inputProps={{
                  name: "contact",
                  required: true,
                  autoFocus: true,
                }}
                containerClass="form-control p-0"
                inputClass="w-100 border-0"
              />
              <p className="text-danger">{userNameErrror}</p>
            </div>

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
                required
              />
            </div>

            {/* {error && <p className="text-danger">{error}</p>} */}
            {success && <p className="text-success">{success}</p>}
            {passwordError && passwordError.map(err => <p className="text-danger">{err}</p>)}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Signing..." : "Sign up"}
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