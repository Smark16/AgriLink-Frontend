import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../Context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const { logoutUser } = useContext(AuthContext); // Use logoutUser for consistency
    const navigate = useNavigate();

    useEffect(() => {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out Successfully',
            text: 'You have been logged out.',
            confirmButtonText: 'OK'
        }).then(() => {
            logoutUser(); // Call the context logout function
            navigate('/login'); // Redirect after logout
        });
    }, [logoutUser, navigate]);

    return null;
}

export default Logout;
