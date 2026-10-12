import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import fetchWeather, { fetchWeatherByCoordinates } from '../weatherService.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
});

function forecastResponse() {
    return {
        current: {
            temperature_2m: 18,
            apparent_temperature: 17,
            wind_speed_10m: 12,
            weather_code: 2,
        },
        daily: {
            time: [
                '2026-10-12',
                '2026-10-13',
                '2026-10-14',
                '2026-10-15',
                '2026-10-16',
            ],
            temperature_2m_max: [20, 19, 17, 16, 18],
            temperature_2m_min: [13, 12, 11, 10, 12],
            weather_code: [0, 2, 3, 61, 95],
        },
    };
}

function mockFetch(handler) {
    globalThis.fetch = handler;
}

test('geocodes a city and maps current conditions and five forecast days', async () => {
    const requestedUrls = [];
    mockFetch(async (url) => {
        requestedUrls.push(url);
        if (url.startsWith('https://geocoding-api.open-meteo.com/')) {
            return {
                ok: true,
                json: async () => ({
                    results: [{
                        name: 'London',
                        country: 'United Kingdom',
                        latitude: 51.5,
                        longitude: -0.12,
                    }],
                }),
            };
        }
        return { ok: true, json: async () => forecastResponse() };
    });

    const result = await fetchWeather('London');

    assert.equal(requestedUrls.length, 2);
    assert.match(requestedUrls[0], /name=London/);
    assert.match(requestedUrls[1], /forecast_days=5/);
    assert.equal(new URL(requestedUrls[1]).searchParams.get('latitude'), '51.5');
    assert.equal(result.temp, 18);
    assert.equal(result.feelsLike, 17);
    assert.equal(result.wind, 12);
    assert.equal(result.condition, 'Partly cloudy');
    assert.equal(result.city, 'London');
    assert.equal(result.country, 'United Kingdom');
    assert.deepEqual(result.forecast, [
        { date: '2026-10-12', maxTemp: 20, minTemp: 13, condition: 'Clear sky' },
        { date: '2026-10-13', maxTemp: 19, minTemp: 12, condition: 'Partly cloudy' },
        { date: '2026-10-14', maxTemp: 17, minTemp: 11, condition: 'Overcast' },
        { date: '2026-10-15', maxTemp: 16, minTemp: 10, condition: 'Rain' },
        { date: '2026-10-16', maxTemp: 18, minTemp: 12, condition: 'Thunderstorm' },
    ]);
});

test('requests forecasts using device coordinates', async () => {
    let requestedUrl;
    mockFetch(async (url) => {
        requestedUrl = url;
        return { ok: true, json: async () => forecastResponse() };
    });

    const result = await fetchWeatherByCoordinates(51.5, -0.12);

    assert.equal(new URL(requestedUrl).searchParams.get('latitude'), '51.5');
    assert.equal(new URL(requestedUrl).searchParams.get('longitude'), '-0.12');
    assert.equal(result.city, 'Your location');
});

test('rejects invalid coordinates without making a request', () => {
    mockFetch(() => assert.fail('fetch should not be called'));

    assert.throws(
        () => fetchWeatherByCoordinates(91, 0),
        { message: 'INVALID_COORDINATES' },
    );
});

test('reports network failures', async () => {
    mockFetch(async () => {
        throw new TypeError('offline');
    });

    await assert.rejects(fetchWeather('London'), { message: 'NETWORK_ERROR' });
});

test('reports missing cities and incomplete forecast data', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({ results: [] }) }));
    await assert.rejects(fetchWeather('Unknown place'), { message: 'CITY_NOT_FOUND' });

    const incompleteForecast = forecastResponse();
    incompleteForecast.daily.time = incompleteForecast.daily.time.slice(0, 1);
    mockFetch(async () => ({ ok: true, json: async () => incompleteForecast }));
    await assert.rejects(fetchWeatherByCoordinates(0, 0), { message: 'WEATHER_UNAVAILABLE' });
});
