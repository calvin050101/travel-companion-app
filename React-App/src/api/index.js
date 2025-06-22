import axios from 'axios';

export const getPlacesData = async (type, sw, ne) => {
  try {
    const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`,
      {
        params:
        {
          bl_latitude: sw.lat,
          tr_latitude: ne.lat,
          bl_longitude: sw.lng,
          tr_longitude: ne.lng,
        },

        headers:
        {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      });

    return data;
  }
  catch (error) {
    console.log(error)
  }
}

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}&` +
      `key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    console.log(`Full geocoding API response: ${data}`); // Debug log
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn('No results found for:', address);
      return null;
    }
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding error: ${data.status}`);
    }
    
    return data.results;
  } catch (error) {
    console.error('Geocoding API error:', error);
    throw error;
  }
};