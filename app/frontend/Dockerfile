FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# Make sure CRA picks this up at build time
COPY .env.production /app/.env.production

# App source
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Use our Nginx config with API proxy + SPA handling
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
