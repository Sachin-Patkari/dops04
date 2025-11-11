FROM node:18-alpine AS build
WORKDIR /app

# ✅ Accept API URL from GitHub Actions
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

# ✅ Copy env file BEFORE building (your own existing line)
COPY .env.production /app/.env.production

# ✅ Copy remaining code
COPY . .

RUN npm run build

# ==========================
# ✅ NGINX STAGE
# ==========================
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
