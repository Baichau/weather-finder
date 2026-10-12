# Weather Finder

A responsive weather app built with vanilla JavaScript and the [Open-Meteo](https://open-meteo.com/) API.

![Weather Finder app screenshot](./screenshot.png)

## Features

- Search for a city to see current temperature, feels-like temperature, wind, and conditions.
- Browse a five-day weather forecast.
- Use your device's location for a local forecast.
- Automatically restore the last successfully searched city.
- Responsive layout, loading indicator, and helpful error messages.

## Tech stack

- HTML5, CSS3, and vanilla JavaScript (ES modules)
- [Open-Meteo](https://open-meteo.com/) geocoding and weather APIs (no API key required)
- Docker with nginx for static hosting

## Run locally

Clone the repository:

```bash
git clone https://github.com/Baichau/weather-finder.git
cd weather-finder
```

Opening `index.html` directly does not work because browsers restrict ES modules loaded from `file://`. Serve the project with any local web server, for example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Run with Docker

Build the image and start the web server:

```bash
docker build -t weather-finder .
docker run -p 8080:80 weather-finder
```

Open <http://localhost:8080>. The container serves the app on port 80.

## Tests

Requires Node.js 18 or later:

```bash
npm test
```

## Deploy to GitHub Pages

The included GitHub Actions workflow enables GitHub Pages if needed and publishes the static app when changes are pushed to `main`.

1. Push to `main` or run **Deploy to GitHub Pages** from the **Actions** tab.
2. The first workflow run enables Pages; check **Settings → Pages** and confirm **GitHub Actions** is the build source.
3. When the deployment completes, the site is available at <https://baichau.github.io/weather-finder/>.

Add that URL as the repository website in the **About** box on the repository's main page.
