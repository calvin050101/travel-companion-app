import React, { useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { Euro, WbSunny } from '@material-ui/icons'; // Added WbSunny icon
import { Link, useNavigate } from 'react-router-dom';
import useStyles from './styles.js';
import { checkUserAuthentication } from '../utilities/authUtils.js';

const Header = ({ onPlaceChanged, onLoad }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkUserAuthentication();
      setIsLoggedIn(isAuthenticated);
    };

    checkAuthentication();
  }, [localStorage.getItem('token')]);

  const handlePlaceChanged = (place) => {
    console.log('Place changed', place);

    if (place && place.geometry && place.geometry.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      console.log('Location:', location);
    } else {
      console.error('Invalid place:', place);
    }
  };

  const handleLoad = (autocomplete) => {
    console.log('Autocomplete loaded', autocomplete);
  };

  const handleAccountCircleClick = () => {
    console.log('AccountCircle clicked');
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Typography variant="h5" className={classes.title}>
          Travel Companion
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="space-between">

          <Link to="/minigame" style={{ textDecoration: 'none' }}>
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

          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{ root: classes.inputRoot, input: classes.inputInput }}
              />
            </div>
          </Autocomplete>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;