import React, {useState,useEffect} from 'react';
import {CssBaseline,Grid} from '@material-ui/core';
import {geocodeAddress} from '../../api';
import {getPlacesData} from '../../api';
import Header from '../Header/Header';
import List from '../List/List';
import Map from '../Map/Map';

// Add a global unhandledrejection event listener
window.addEventListener('unhandledrejection', function (event) {
    // Log the error object to the console
    console.error('Unhandled promise rejection:', event.reason);
  });

const Home = () => 
{
    const [type,setType] = useState('attractions');
    const [rating,setRating] = useState('');

    const[coordinates,setCoordinates] = useState({});
    const [bounds,setBounds] = useState({});

    const [filteredPlaces,setFilteredPlaces] = useState([]);
    const [places,setPlaces] = useState([]);

    const [autocomplete,setAutocomplete] = useState(null);
    const [childClicked, setChildClicked] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [searchError, setSearchError] = useState(null);

    useEffect(() => 
    {
        navigator.geolocation.getCurrentPosition(({coords: {latitude,longitude}}) => { 
            setCoordinates({lat:latitude,lng:longitude});    
        });
    }, []);

    useEffect(() => 
    {
        const filteredPlaces = places.filter((place) => Number(place.rating) > rating);

        setFilteredPlaces(filteredPlaces);
    }, [rating]);

    useEffect(() => {
        if (bounds.sw && bounds.ne)
        {
            setIsLoading(true);
        
        getPlacesData(type,bounds.sw,bounds.ne)
            .then((data)=> 
            {
                setPlaces(data.filter((place) => place.name && place.num_reviews > 0)); //filters out dummy data
                setFilteredPlaces([]);
                setRating('');
                setIsLoading(false);
            })
    } 
}, [bounds,type]);

    const onLoad = (autoC) => setAutocomplete(autoC);

    const onPlaceChanged = () =>{
        const place = autocomplete.getPlace();
        if (place.geometry){
        const lat = autocomplete.getPlace().geometry.location.lat();
        const lng = autocomplete.getPlace().geometry.location.lng();
        setCoordinates({lat,lng});
        };
    };

    // Add this new function for direct search
    const handleDirectSearch = async (query) => {
        if (!query.trim()) {
            setSearchError(null);
            return;
        }

        setSearchError(null);
        setIsLoading(true);
        
        try {
        const results = await geocodeAddress(query);
        
        if (!results || results.length === 0) {
            setSearchError('Location not found');
            return;
        }
        
        const firstResult = results[0];
        if (firstResult.geometry && firstResult.geometry.location) {
            const location = firstResult.geometry.location;
            
            // Check if location is a function (Google Maps LatLng object) or a plain object with lat/lng properties
            const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
            const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
            
            setCoordinates({
                lat,
                lng,
            });
        } else {
            setSearchError('Location data not available');
        }
    } catch (error) {
        console.error('Search error:', error);
        setSearchError(error.message || 'Search failed');
    } finally {
        setIsLoading(false);
        }
    };

    return (
        <>
            <CssBaseline />
            <Header onPlaceChanged = {onPlaceChanged} onLoad = {onLoad} onDirectSearch = {handleDirectSearch} searchError = {searchError}/>
            <Grid container spacing={3} style={{width: '100%'}}>
                <Grid item xs={12} md={4}>
                    <List 
                        places={filteredPlaces.length ? filteredPlaces : places}
                        childClicked = {childClicked}
                        isLoading = {isLoading}
                        type = {type}
                        setType = {setType}
                        rating = {rating}
                        setRating = {setRating}
                    />
                </Grid>
                <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Map 
                        setCoordinates={setCoordinates}
                        setBounds={setBounds}
                        coordinates={coordinates}
                        places = {filteredPlaces.length ? filteredPlaces:places}
                        setChildClicked = {setChildClicked}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default Home;