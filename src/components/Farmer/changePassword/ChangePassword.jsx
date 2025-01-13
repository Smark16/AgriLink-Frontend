import React, {useState} from 'react'
import UseAxios from '../../AxiosInstance/AxiosInstance';
import '../changePassword/password.css'

const changePassword = 'http://127.0.0.1:8000/agriLink/change-password/';
function ChangePassword() {
    const axiosInstance = UseAxios()
    console.log(axiosInstance)
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    // change password
    const handlePassword = async (e) => {
        setStatus(true)
        e.preventDefault();
    
        if (newPassword !== confirmPassword) {
          setMessage("Passwords do not match");
          setStatus(false)
          return;
        }
    
        const formData = new FormData();
        formData.append("old_password", oldPassword);
        formData.append("password", newPassword);
        formData.append("password2", confirmPassword);
    
        try {
          const response = await axiosInstance.put(changePassword, formData);
          setMessage(response.data.message);
          setStatus(false)
        } catch (error) {
          const errorMsg = error.response.data;
          if (errorMsg.old_password) {
            setMessage(errorMsg.old_password);
          } else {
            setMessage("An error occurred. Please try again.");
          }
          setStatus(false)
        }
      };
    
    
  return (
    <>
    <h4 className='mt-3'>Change Password</h4>

    <form onSubmit={handlePassword} className='mt-4 p-2 bg-white password_form'>
                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label">Old Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="oldPassword"
                    name='oldPassword'
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name='newPassword'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  {status ? 'reseting...' : 'Update Password'}
              
                  </button>
                {message && <div className="alert alert-info mt-3">{message}</div>}
              </form>
    </>
  )
}

export default ChangePassword
