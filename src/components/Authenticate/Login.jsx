import React, {useContext, useState, useEffect} from 'react'
import '../Authenticate/Auth.css'
import { Link } from 'react-router-dom'
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Remove destructuring here.
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../Context/AuthContext';

const loginUrl = 'https://agrilink-backend-hjzl.onrender.com/agriLink/'
const resetLinkUrl = 'https://agrilink-backend-hjzl.onrender.com/agriLink/send_email'

function Login() {
  const { setUser} = useContext(AuthContext);
  const [authTokens, setAuthTokens] = useState(() => JSON.parse(localStorage.getItem('authtokens')) || null);
  const [noActive, setNoActive] = useState('');
  const [userLogin, setUserLogin] = useState({ username: "", password: "" });
  const [loader, setLoader] = useState(false);
  const [link, setLink] = useState({ email: "" });
  const [status, setStatus] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e)=>{
   const {name, value} = e.target
   setUserLogin({...userLogin, [name]:value})
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    const formData = new FormData();
    formData.append("username", userLogin.username);
    formData.append("password", userLogin.password);

    axios.post(loginUrl, formData)
      .then(response => {
        console.log(response)
        if (response.status === 200) {
          const data = response.data;
          setLoader(false);
          localStorage.setItem('authtokens', JSON.stringify(data));
          setAuthTokens(data);
          setUser(jwtDecode(data.access));
          showSuccessAlert("Logging in...");
        } else {
          showErrorAlert("Please provide correct username/password");
        }
      })
      .catch(err => {
        console.log("Error", err);
        if (err.response.data.detail) {
          setNoActive(err.response.data.detail);
        }
      }).finally(() => {
        setLoader(false);
      });
  };

  // Send reset link
  const handleLinkSubmit = (e) => {
    e.preventDefault();
    setStatus(true);

    const formData = new FormData();
    formData.append("email", link.email);

    axios.post(resetLinkUrl, formData)
      .then(res => {
        console.log(res);
        setStatus(false);
        showSuccessAlert("Reset link sent successfully to your email");
      })
      .catch(error => {
        console.log(error);
        showErrorAlert("There was an issue sending the reset link. Confirm Email!");
        setStatus(false);
      });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "success",
      timer: 6000,
      toast: true,
      position: 'top-right',
      timerProgressBar: true,
      showConfirmButton: true,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: message,
      icon: "error",
      timer: 6000,
      toast: true,
      position: 'top',
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    console.log("Auth tokens:", authTokens);
  
    if (authTokens) {
      const decodedUser = jwtDecode(authTokens.access);
      console.log("Decoded user:", decodedUser);
  
      setUser(decodedUser);
  
      axios.get(`https://agrilink-backend-hjzl.onrender.com/agriLink/single_profile/${decodedUser.user_id}`)
        .then((response) => {
          console.log("Fetched user profile:", response.data);
          setUserProfile(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [authTokens]);
  
  useEffect(() => {
    console.log("User profile updated:", userProfile);
  
    if (userProfile) {
      if (userProfile.is_farmer) {
        if (!userProfile.location || userProfile.location.trim() === "") {
          console.log("Redirecting to farmer additional info");
          navigate("/farmer/farmer_additional_info");
        } else {
          console.log("Redirecting to farmer listings");
          navigate("/farmer/listings");
        }
      } else if (userProfile.is_buyer) {
        console.log("Redirecting to buyer page");
        navigate("/buyer/all_farmers");
      }
    }
  }, [userProfile, navigate]);
  

  return (
    <>
    <div className="login">
    {noActive && <p className='alert alert-warning'>{noActive}</p>}
        <h6 className='text-center bg-success text-white p-2'>AgriLink Login</h6>
        <form className='p-3' onSubmit={handleSubmit}>
        <>
  <div className="mb-3">
    <label htmlFor="formGroupExampleInput" className="form-label">
      Enter Phone Number
    </label>
    <input
      type="text"
      className="form-control"
      id="formGroupExampleInput"
      placeholder="e.g 0759079867"
      name='username'
      value={userLogin.username}
      onChange={handleChange}
    />
  </div>
  <div className="mb-3">
    <label htmlFor="formGroupExampleInput2" className="form-label">
      <span>Enter Password</span>
      <p onClick={() => setShowModal(true)} className='forgot'>Forgot Password?</p>
    </label>
    <input
      type="password"
      className="form-control"
      id="formGroupExampleInput2"
      placeholder="Enter Password"
      name='password'
      value={userLogin.password}
      onChange={handleChange}
    />
  </div>
</>
<button type='submit'>{loader ? 'Loading...' : 'Login'}</button>
<p>Dont Have Account?  <Link to='/signup' className='text-success'>Sign Up</Link></p>
        </form>
    </div>

    
      {/* Custom Modal */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <h5 className="custom-modal-title">Change Password</h5>
              <button type="button" className="close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
              <form onSubmit={handleLinkSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Enter Your User Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={link.email}
                    onChange={(e) => setLink({ ...link, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn_reset">
                  {status ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Login
