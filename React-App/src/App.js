import React from 'react';
import {CssBaseline} from '@material-ui/core';
import './components/Pages/FormStyles/FormStyles.css';

import {BrowserRouter, Form, Route, Routes} from 'react-router-dom';
import HomePage from './components/Pages/HomePage';
import LoginPage from './components/Pages/LoginPage';
import RegistrationPage from './components/Pages/RegistrationPage';
import Dashboard from './components/Pages/DashboardPage.jsx';
import Minigamepage from './components/Pages/MinigamePage';
import {SelectedPlaceProvider} from './components/PlaceDetails/SelectedPlaceContext';
import NotFound from './components/Pages/404Page';

const App = () => 
{
    return (
        <BrowserRouter>
            <SelectedPlaceProvider>
                    <CssBaseline />
                    <Routes>
                        <Route path = "/" element = {<HomePage />} index = {true} /> {/* Set default */}
                        <Route path = "/login" element = {<LoginPage />} />
                        <Route path = "/register" element = {<RegistrationPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/minigame" element={<Minigamepage />} />
                        <Route path = "*" element={<NotFound />} />
                    </Routes>
            </SelectedPlaceProvider>
        </BrowserRouter>
            
    );
};

export default App;