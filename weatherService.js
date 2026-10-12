const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

function describeWeatherCode(code) {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if ([51, 53, 55].includes(code)) return 'Drizzle';
    if ([56, 57].includes(code)) return 'Freezing drizzle';
    if ([61, 63, 65].includes(code)) return 'Rain';
    if ([66, 67].includes(code)) return 'Freezing rain';
    if ([71, 73, 75, 77].includes(code)) return 'Snow';
    if ([80, 81, 82].includes(code)) return 'Rain showers';
    if ([85, 86].includes(code)) return 'Snow showers';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';
    return 'N/A';
}

async function requestForecast(latitude, longitude, location) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m,apparent_temperature,wind_speed_10m,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        forecast_days: '5',
        timezone: 'auto',
    });

    let response;
    try {
        response = await fetch(`${FORECAST_API}?${params}`);
    } catch {
        throw new Error('NETWORK_ERROR');
    }

    if (!response.ok) {
        throw new Error('WEATHER_UNAVAILABLE');
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('WEATHER_UNAVAILABLE');
    }

    const current = data.current;
    const daily = data.daily;
    if (!current || !daily?.time || daily.time.length < 5) {
        throw new Error('WEATHER_UNAVAILABLE');
    }

    return {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        wind: current.wind_speed_10m,
        condition: describeWeatherCode(current.weather_code),
        city: location.city,
        country: location.country,
        forecast: daily.time.slice(0, 5).map((date, index) => ({
            date,
            maxTemp: daily.temperature_2m_max[index],
            minTemp: daily.temperature_2m_min[index],
            condition: describeWeatherCode(daily.weather_code[index]),
        })),
    };
}

export default async function fetchWeather(cityName) {
    const params = new URLSearchParams({
        name: cityName,
        count: '1',
        language: 'en',
        format: 'json',
    });

    let response;
    try {
        response = await fetch(`${GEOCODING_API}?${params}`);
    } catch {
        throw new Error('NETWORK_ERROR');
    }

    if (!response.ok) {
        throw new Error('CITY_NOT_FOUND');
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('CITY_NOT_FOUND');
    }

    const place = data.results?.[0];
    if (!place) {
        throw new Error('CITY_NOT_FOUND');
    }

    return requestForecast(place.latitude, place.longitude, {
        city: place.name,
        country: place.country || '',
    });
}

export function fetchWeatherByCoordinates(latitude, longitude) {
    if (
        !Number.isFinite(latitude)
        || !Number.isFinite(longitude)
        || latitude < -90
        || latitude > 90
        || longitude < -180
        || longitude > 180
    ) {
        throw new Error('INVALID_COORDINATES');
    }

    return requestForecast(latitude, longitude, {
        city: 'Your location',
        country: '',
    });
}
