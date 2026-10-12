import fetchWeather, { fetchWeatherByCoordinates } from './weatherService.js';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const locationBtn = document.querySelector('#location-btn');
const resultSection = document.querySelector('#weather-result');
const statusMsg = document.querySelector('#status-message');
const locationName = document.querySelector('#location-name');
const weatherSymbol = document.querySelector('#weather-symbol');
const tempValue = document.querySelector('#temp-value');
const feelsLikeValue = document.querySelector('#feels-like-value');
const windValue = document.querySelector('#wind-value');
const conditionValue = document.querySelector('#condition-value');
const forecastList = document.querySelector('#forecast-list');
const LAST_CITY_KEY = 'weather-finder-last-city';

function showStatus(message, { isError = false, isLoading = false } = {}) {
    statusMsg.hidden = false;
    statusMsg.classList.toggle('is-error', isError);
    statusMsg.replaceChildren();

    if (isLoading) {
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        spinner.setAttribute('aria-hidden', 'true');
        statusMsg.append(spinner);
    }

    statusMsg.append(document.createTextNode(message));
    resultSection.hidden = true;
}

function formatDay(dateString, index) {
    if (index === 0) return 'Today';
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;

    return new Intl.DateTimeFormat(undefined, { weekday: 'short' })
        .format(new Date(year, month - 1, day));
}

function weatherIcon(condition) {
    const description = condition.toLowerCase();
    if (description.includes('thunder')) return '⛈';
    if (description.includes('snow') || description.includes('sleet')) return '❄';
    if (description.includes('rain') || description.includes('drizzle')) return '🌧';
    if (description.includes('cloud') || description.includes('overcast')) return '☁';
    if (description.includes('sun') || description.includes('clear')) return '☀';
    return '🌤';
}

function renderForecast(forecast) {
    forecastList.replaceChildren();

    forecast.forEach((day, index) => {
        const card = document.createElement('article');
        card.className = 'forecast-day';

        const dayName = document.createElement('h4');
        dayName.textContent = formatDay(day.date, index);

        const icon = document.createElement('span');
        icon.className = 'forecast-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = weatherIcon(day.condition);

        const temperatures = document.createElement('div');
        temperatures.className = 'forecast-temperatures';
        const maximum = document.createElement('strong');
        maximum.textContent = `${day.maxTemp}°`;
        const minimum = document.createElement('span');
        minimum.textContent = `${day.minTemp}°`;

        temperatures.append(maximum, minimum);
        card.append(dayName, icon, temperatures);
        forecastList.append(card);
    });
}

function showWeather(weather) {
    const { city, country, temp, feelsLike, wind, condition, forecast } = weather;
    locationName.textContent = country ? `${city}, ${country}` : city;
    tempValue.textContent = temp;
    feelsLikeValue.textContent = feelsLike ?? temp;
    windValue.textContent = wind;
    conditionValue.textContent = condition;
    weatherSymbol.textContent = weatherIcon(condition);
    renderForecast(forecast);
    resultSection.hidden = false;
    statusMsg.hidden = true;
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    locationBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Searching...' : 'Search';
}

function showRequestError(error) {
    console.error(error);
    if (error.message === 'NETWORK_ERROR') {
        showStatus('Network error. Please check your connection.', { isError: true });
    } else if (error.message === 'CITY_NOT_FOUND') {
        showStatus('City not found. Please check the spelling and try again.', { isError: true });
    } else if (error.message === 'LOCATION_UNAVAILABLE') {
        showStatus('Your location could not be determined. Please try again.', { isError: true });
    } else if (error.message === 'LOCATION_DENIED') {
        showStatus('Location access was denied. Allow access or search for a city.', { isError: true });
    } else if (error.message === 'WEATHER_UNAVAILABLE') {
        showStatus('Weather data is temporarily unavailable. Please try again later.', { isError: true });
    } else {
        showStatus('Failed to get weather. Please try again later.', { isError: true });
    }
}

async function loadWeather(request, savedCity = '') {
    try {
        setLoading(true);
        showStatus('Getting your forecast...', { isLoading: true });
        const weather = await request();
        showWeather(weather);

        if (savedCity) {
            try {
                localStorage.setItem(LAST_CITY_KEY, savedCity);
            } catch (error) {
                console.warn('Unable to save the last city in this browser.', error);
            }
        }
    } catch (error) {
        showRequestError(error);
    } finally {
        setLoading(false);
    }
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (!cityName) {
        showStatus('Please enter a city name.', { isError: true });
        return;
    }

    loadWeather(() => fetchWeather(cityName), cityName);
});

locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showStatus('Location is not supported by this browser.', { isError: true });
        return;
    }

    setLoading(true);
    showStatus('Finding your location...', { isLoading: true });
    navigator.geolocation.getCurrentPosition(
        ({ coords }) => loadWeather(
            () => fetchWeatherByCoordinates(coords.latitude, coords.longitude),
        ),
        (error) => {
            setLoading(false);
            const locationError = new Error(
                error.code === error.PERMISSION_DENIED
                    ? 'LOCATION_DENIED'
                    : 'LOCATION_UNAVAILABLE',
            );
            showRequestError(locationError);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
});

try {
    const lastCity = localStorage.getItem(LAST_CITY_KEY);
    if (lastCity) {
        cityInput.value = lastCity;
        loadWeather(() => fetchWeather(lastCity));
    }
} catch (error) {
    console.warn('Unable to restore the last city from this browser.', error);
}
