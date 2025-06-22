import {CssBaseline} from '@material-ui/core';
import './components/Pages/FormStyles/FormStyles.css';

import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './components/Pages/HomePage';
import LoginPage from './components/Pages/LoginPage';
import RegistrationPage from './components/Pages/RegistrationPage';
import WeatherPage from './components/Pages/WeatherPage';
import Dashboard from './components/Pages/DashboardPage.jsx';
import Currencypage from './components/Pages/CurrencyPage';
import {SelectedPlaceProvider} from './components/PlaceDetails/SelectedPlaceContext';
import NotFound from './components/Pages/404Page';

const App = () => 
{
    return (
        <BrowserRouter>
            <SelectedPlaceProvider>
                    <CssBaseline />
                    <Routes>
                        <Route path = "/" element = {<HomePage />} index = {true} />                
                        <Route path = "/login" element = {<LoginPage />} />
                        <Route path = "/register" element = {<RegistrationPage />} />
                        <Route path = "/weather" element = {<WeatherPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/currency" element={<Currencypage />} /> 
                        <Route path = "*" element={<NotFound />} />
                    </Routes>
            </SelectedPlaceProvider>
        </BrowserRouter>
            
    );
};

export default App;