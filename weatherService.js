export default async function fetchWeather(cityName) {
    const url = `https://wttr.in/${encodeURIComponent(cityName)}?format=j1`;

    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new Error('NETWORK_ERROR');
    }

    if (!response.ok) {
        throw new Error('CITY_NOT_FOUND');
    }

    const data = await response.json();

    const current = data.current_condition?.[0];
    const nearestArea = data.nearest_area?.[0];

    if (!current || !nearestArea) {
        throw new Error('CITY_NOT_FOUND');
    }

    return {
        temp: current.temp_C,
        wind: current.windSpeedKmph,
        condition: current.weatherDesc?.[0]?.value || 'N/A',
        city: nearestArea.areaName?.[0]?.value || cityName,
        country: nearestArea.country?.[0]?.value || '',
    };
}