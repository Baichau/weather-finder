FROM nginx:alpine

COPY index.html style.css app.js weatherService.js /usr/share/nginx/html/

EXPOSE 80
