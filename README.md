# Weather Finder

A simple, responsive weather application that fetches real-time weather data for any city worldwide. Built with vanilla JavaScript (ES modules) and the [wttr.in](https://wttr.in) API.

## Features

- Enter a city name to get current weather conditions.
- Displays:
  - City name and country
  - Temperature (°C)
  - Wind speed (km/h)
  - Weather condition (e.g., Sunny, Light Rain)
- Clean error handling for empty input, invalid city, and network issues.
- Mobile-friendly design.

## Tech Stack

- HTML5
- CSS3 (optional – see `style.css`)
- Vanilla JavaScript (ES6+ modules)
- [wttr.in](https://wttr.in) API (no key required)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari).
- A local web server to serve ES modules. Opening `index.html` directly with `file://` will not work due to CORS restrictions.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yBaichau/weather-finder.git
   cd weather-finder