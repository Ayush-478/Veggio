import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Restaurant as RestaurantIcon,
  Receipt as ReceiptIcon,
  LocalDining as DiningIcon,
  MonetizationOn as MoneyIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  
  const navigate = useNavigate();
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };
  
  const cartItemCount = cart?.items?.length || 0;
  
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        VeggIO
      </Typography>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemIcon>
            <RestaurantIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={RouterLink} to="/menu">
          <ListItemIcon>
            <DiningIcon />
          </ListItemIcon>
          <ListItemText primary="Menu" />
        </ListItem>
        
        {isAuthenticated ? (
          <>
            <ListItem button component={RouterLink} to="/orders">
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem button component={RouterLink} to="/calorie-tracker">
              <ListItemIcon>
                <RestaurantIcon />
              </ListItemIcon>
              <ListItemText primary="Calorie Tracker" />
            </ListItem>
            <ListItem button component={RouterLink} to="/expense-tracker">
              <ListItemIcon>
                <MoneyIcon />
              </ListItemIcon>
              <ListItemText primary="Expense Tracker" />
            </ListItem>
            <ListItem button component={RouterLink} to="/chat">
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="ChefBot" />
            </ListItem>
            <ListItem button component={RouterLink} to="/profile">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem button component={RouterLink} to="/login">
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            VeggIO
          </Typography>
          
          {/* Mobile logo */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            VeggIO
          </Typography>
          
          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/menu"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Menu
            </Button>
            
            {isAuthenticated && (
              <>
                <Button
                  component={RouterLink}
                  to="/orders"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Orders
                </Button>
                <Button
                  component={RouterLink}
                  to="/calorie-tracker"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Calorie Tracker
                </Button>
                <Button
                  component={RouterLink}
                  to="/expense-tracker"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Expense Tracker
                </Button>
                <Button
                  component={RouterLink}
                  to="/chat"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  ChefBot
                </Button>
              </>
            )}
          </Box>
          
          {/* Cart icon */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0, mr: 2 }}>
              <IconButton
                component={RouterLink}
                to="/cart"
                size="large"
                aria-label="show cart items"
                color="inherit"
              >
                <Badge badgeContent={cartItemCount} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Box>
          )}
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="secondary"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 