# 1. Start with a secure R image that already has RStudio or Shiny
FROM rocker/shiny:latest

# 2. Install Linux tools needed for maps and weather data tracking
RUN apt-get update && apt-get install -y \
    libssl-dev \
    libcurl4-openssl-dev \
    libgdal-dev

# 3. Install the specific R packages your weather app uses
RUN R -e "install.packages(c('httr', 'jsonlite', 'leaflet', 'ggplot2'), repos='https://r-project.org')"

# 4. Copy your actual R script/app code into the container
COPY . /srv/shiny-server/

# 5. Open the network port for the web app
EXPOSE 3838
