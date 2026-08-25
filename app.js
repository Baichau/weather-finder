import fetchWeather from './weatherService.js';

const cityInput = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const resultSection = document.querySelector('#weather-result');
const statusMsg = document.querySelector('#status-message');
const locationName = document.querySelector('#location-name');
const tempValue = document.querySelector('#temp-value');
const windValue = document.querySelector('#wind-value');
const conditionValue = document.querySelector('#condition-value');

function showStatus(message, isError = false) {
    statusMsg.style.display = 'block';
    statusMsg.textContent = message;
    statusMsg.style.color = isError ? '#d32f2f' : '#333';
    resultSection.style.display = 'none';
}

function showWeather(city, country, temp, wind, condition) {
    locationName.textContent = `${city}, ${country}`;
    tempValue.textContent = temp;
    windValue.textContent = wind;
    conditionValue.textContent = condition;
    resultSection.style.display = 'block';
    statusMsg.style.display = 'none';
}

function setLoading(isLoading) {
    if (isLoading) {
        searchBtn.textContent = 'Loading...';
        searchBtn.disabled = true;
    } else {
        searchBtn.textContent = 'Search Weather';
        searchBtn.disabled = false;
    }
}

async function handleSearch() {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        showStatus('Please enter a city name!', true);
        return;
    }

    try {
        setLoading(true);
        showStatus(`Loading weather for ${cityName}...`);
        const { city, country, temp, wind, condition } = await fetchWeather(cityName);
        showWeather(city, country, temp, wind, condition);
    } catch (error) {
        console.error(error);
        if (error.message === 'NETWORK_ERROR') {
            showStatus('Network error. Please check your connection.', true);
        } else if (error.message === 'CITY_NOT_FOUND') {
            showStatus('City not found. Please check the spelling and try again.', true);
        } else {
            showStatus('Failed to get weather. Please try again later.', true);
        }
    } finally {
        setLoading(false);
    }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});