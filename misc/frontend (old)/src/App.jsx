import './App.css'
import {useState} from "react";
import axios from "axios";

function App() {
    const [cityName, setCityName] = useState("");
    const [weatherData, setWeatherData] = useState({});

    const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const getWeatherData = async () => {
        if (!cityName) {
            setError('Please enter a city name.');
            setWeatherData(null);
            return;
        }

        setLoading(true);
        setError('');
        setWeatherData(null);

        try {
            const response = await axios.get(
                `${WEATHER_API_URL}?q=${cityName}&units=metric&appid=${WEATHER_API_KEY}`
            );
            const data = response.data;

            setWeatherData({
                weather: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                temp: data.main.temp,
                feelsLike: data.main.feels_like, // Corrected from feelsLike to feels_like
                windSpeed: data.wind.speed,
                windDirection: data.wind.deg,
                humidity: data.main.humidity, // Added humidity for more info
                pressure: data.main.pressure, // Added pressure for more info
                cityName: data.name // Store the actual city name from the API response
            });
        } catch (err) {
            if (err.response) {
                setError(`Error: ${err.response.data.message || 'City not found'}. Please try again.`);
            } else if (err.request) {
                setError('Error: No response from server. Please check your internet connection.');
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        getWeatherData().then(() => {
        });
    };

    return (
        <div className="weather-container">
            <h1 style={{textAlign: 'center', color: '#333'}}>Current Weather</h1>

            <form className="weather-form" onSubmit={handleSubmit}>
                <input
                    className="city-input"
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Enter city name"
                />
                <button type="submit" className="get-weather-btn">Get Weather</button>
            </form>

            {loading && <p className="loading-text">Loading weather data...</p>}

            {error && <p className="error-message">{error}</p>}

            {
                weatherData &&
                (
                    <div className="main-container">
                        <h2>{weatherData.cityName}</h2>
                        <div className="top-container">
                            {weatherData.icon && (
                                <img
                                    src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                                    alt={weatherData.description}
                                    style={{width: '80px', height: '80px'}}
                                />
                            )}
                            <p className="temperature-text">{weatherData.temp}°C</p>
                        </div>
                        <p className="weather-text">
                            {weatherData.description} ({weatherData.weather})
                        </p>
                        <div className="weather-grid">
                            <p><strong>Feels like:</strong> {weatherData.feelsLike}°C</p>
                            <p><strong>Wind Speed:</strong> {weatherData.windSpeed} m/s</p>
                            <p><strong>Wind Direction:</strong> {weatherData.windDirection}°</p>
                            <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
                            <p><strong>Pressure:</strong> {weatherData.pressure} hPa</p>
                        </div>
                    </div>
                )
            }
            {!loading && !error && !weatherData && (
                <p style={{textAlign: 'center', color: '#777'}}>Enter a city name to see the weather.</p>
            )}
        </div>
    );
}

export default App
