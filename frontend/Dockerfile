FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY vendor ./vendor
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
