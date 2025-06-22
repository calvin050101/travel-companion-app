import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { Euro, WbSunny } from '@material-ui/icons'; // Added WbSunny icon
import { Link, useNavigate } from 'react-router-dom';
import useStyles from './styles.js';
import { checkUserAuthentication } from '../utilities/authUtils.js';

const Header = ({ onPlaceChanged, onLoad, onDirectSearch, searchError }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkUserAuthentication();
      setIsLoggedIn(isAuthenticated);
    };

    checkAuthentication();
  }, [localStorage.getItem('token')]);

  const handleAccountCircleClick = () => {
    console.log('AccountCircle clicked');
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if wrapped in a form
      onDirectSearch(searchQuery);
      setSearchQuery(''); // Clear input after successful search
    }
  };

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Typography variant="h5" className={classes.title}>
          Travel Companion
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="space-between">

          <Link to="/currency" style={{ textDecoration: 'none' }}>
            <IconButton aria-label="Euro" style={{ color: '#e1e1e1' }}>
              <Euro />
            </IconButton>
          </Link>

          <Link to="/weather" style={{ textDecoration: 'none' }}>
            <IconButton aria-label="Weather" style={{ color: '#e1e1e1' }}>
              <WbSunny />
            </IconButton>
          </Link>

          {isLoggedIn ? (
            <IconButton
              aria-label="account-circle"
              color="inherit"
              onClick={handleAccountCircleClick}
            >
              <AccountCircle />
            </IconButton>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <IconButton aria-label="account-circle" color="inherit">
                <AccountCircle />
              </IconButton>
            </Link>
          )}

          <Box display ="flex" flexDirection = "column">
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  inputRef={inputRef}
                  placeholder="Search…"
                  classes={{ root: classes.inputRoot, input: classes.inputInput }}
                  value = {searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </Autocomplete>
            {searchError && (
              <Typography color="error" variant="caption">
                {searchError}
              </Typography>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;