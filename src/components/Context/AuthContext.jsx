import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => JSON.parse(localStorage.getItem('authtokens')) || null);
  const [user, setUser] = useState(() => (authTokens ? jwtDecode(authTokens.access) : null));
  const [loading, setLoading] = useState(true);
  const [FarmerNotification, setFarmerNotification] = useState()
  
  const navigate = useNavigate();

  useEffect(() => {
    if (authTokens) {
      const decodedUser = jwtDecode(authTokens.access);
      setUser(decodedUser);
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        navigate(lastPath);  // Redirect to last accessed page if available
        localStorage.removeItem('lastPath');  // Clear after redirecting
      }
    }
    setLoading(false);
  }, [authTokens, navigate]);

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authtokens');
    localStorage.removeItem('lastPath');
    navigate('/login');
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    logoutUser,
    FarmerNotification, 
    setFarmerNotification,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
