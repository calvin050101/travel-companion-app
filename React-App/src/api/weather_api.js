import axios from 'axios';

export const getWeatherData = async (cityName) => {
  try {
    const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/weather`,
      {
        params:
        {
          q: cityName,
          units: 'metric',
          appid: process.env.REACT_APP_WEATHER_API_KEY
        }
      });

    return data;
  } catch (error) {
    console.log(error);
  }
}