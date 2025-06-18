import React from 'react';
import { AppBar, Toolbar, Box, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import HeaderStyles from './HeaderStyles'; // Custom styling

const FormHeaderDashboard = ({ toggleSidebar }) => {
  const classes = HeaderStyles();

  const handleHomeClick = () => {
    console.log('Home button clicked');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center">
          <Button onClick={toggleSidebar} style={{ color: 'white' }}>☰ Menu</Button>
          <Button component={Link} to="/" className={classes.homeButton} onClick={handleHomeClick}>
            Home
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default FormHeaderDashboard;
