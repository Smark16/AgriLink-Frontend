import React, { useContext, useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import FarmerNotifications from '../Farmer/FarmerNotifications/FamerNotifications';
import './Navbar.css';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '#' },
];
const authPages = [
  { name: 'LOGIN', path: '/login' },
  { name: 'SIGN UP', path: '/signup' },
];
const settings = [
  { name: 'Profile', path: '/farmer/profile' },
  { name: 'Market Insights', path: '/farmer/insights' },
  { name: 'Change Password', path: '/farmer/change-password' },
  { name: 'Logout', path: '/farmer/logout' },
];

function ResponsiveAppBar() {
  const { user } = useContext(AuthContext);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationPage, setShowNotificationPage] = useState(false);

  const fetchNotificationCount = async () => {
    try {
      const encodedUserId = encodeURIComponent(user.user_id);
      const response = await axios.get(`http://127.0.0.1:8000/agriLink/user_notifications/${encodedUserId}`);
      const unreadCount = response.data.notifications.filter((notif) => !notif.is_read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user?.is_farmer) {
      fetchNotificationCount();
    }
  }, [user]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNotificationRead = () => {
    setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 'none' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              AgriLink
            </Typography>

            {/* Navigation for mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
              {!user && (
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                sx={{ mr: 1 }}
              >
              <MenuIcon />
              </IconButton>
              )}

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {!user && pages.map((page) => (
                  <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                    <Typography component={Link} to={page.path} sx={{ textDecoration: 'none', color: 'black' }}>
                      {page.name}
                    </Typography>
                  </MenuItem>
                ))}

                {!user && authPages.map((page) => (
                  <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                    <Typography component={Link} to={page.path} sx={{ textDecoration: 'none', color: 'black' }}>
                      {page.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* desktop navigation */}
            {!user && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                {pages.map((page) => (
                  <Button
                    key={page.name}
                    component={Link}
                    to={page.path}
                    sx={{ my: 2, color: 'black', display: 'block', textTransform: 'none' }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box>
            )}

            {!user && (
              <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
                {authPages.map((page) => (
                  <Button
                    key={page.name}
                    component={Link}
                    to={page.path}
                    sx={{ my: 2, color: 'black', display: 'block', textTransform: 'none', ml: 2 }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box>
            )}

           {/* User area for authenticated users */}
            {user && user.is_farmer && (
              <Box sx={{ flexGrow: 1, justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ mr: 1 }} onClick={() => setShowNotificationPage(!showNotificationPage)}>
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                      <Typography component={Link} to={setting.path} sx={{ textDecoration: 'none', color: 'black' }}>
                        {setting.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {showNotificationPage && (
        <FarmerNotifications onNotificationRead={handleNotificationRead} />
      )}
    </>
  );
}

export default ResponsiveAppBar;