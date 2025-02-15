import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import {jwtDecode} from 'jwt-decode';  // Correct import, remove brackets

const baseURL = 'https://agrilink-backend-hjzl.onrender.com/agriLink';

const UseAxios = () => {
  const { setUser, authTokens, setAuthTokens } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);  // Handle loading state
// console.log('use axios', authTokens)
  // Load authTokens from localStorage when the component mounts
  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem("authtokens"));
    if (tokens) {
      console.log(tokens)
      setAuthTokens(tokens);
      setUser(jwtDecode(tokens.access));
    }
    setIsLoading(false);  // Finished loading
  }, []);

  // Wait until authTokens are available or until loading is finished
  if (isLoading || !authTokens) {
    console.log('authTokens is still loading or not set');
    return null;  // Render nothing or return a loading spinner
  }

  // Create Axios instance with the current access token
  const axiosInstance = axios.create({
    baseURL,
    headers: { "Authorization": `Bearer ${authTokens.access}` },  // Safe access to authTokens.access
  });

  axiosInstance.interceptors.request.use(async (req) => {
    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;  // Check token expiration

    if (!isExpired) return req;  // If token is not expired, proceed with the request

    try {
      // Refresh the token if expired
      const response = await axios.post("https://agrilink-backend-hjzl.onrender.com/api/token/refresh/", {
        refresh: authTokens.refresh,
      });

      localStorage.setItem("authtokens", JSON.stringify(response.data));
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));

      req.headers.Authorization = `Bearer ${response.data.access}`;  // Update request with new access token
      return req;
    } catch (error) {
      console.error("Error refreshing token:", error);

      // Handle token refresh failure: clear auth data and log out the user
      setAuthTokens(null);
      setUser(null);
      localStorage.removeItem('authtokens');
      Swal.fire({
        icon: 'success',
        title: 'Your session has expired',
        text: 'You have been logged out.',
        timer: 6000,
        confirmButtonText: 'OK'
      });
      window.location.href = '/login';
      return Promise.reject(error);  // Reject the request with an error
    }
  });

  return axiosInstance;
};

export default UseAxios;