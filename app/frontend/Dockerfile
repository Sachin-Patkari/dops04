FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ Copy env file BEFORE building
COPY .env.production /app/.env.production

# ✅ Copy the rest of the code
COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
