# Stage 1 — build
FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2 — serve with NGINX
FROM nginx:1.25-alpine

# Копируем статику в правильную директорию
COPY --from=builder /app/dist /usr/share/nginx/html

# Кастомный конфиг, чтобы SPA работала как надо
COPY nginx.conf /etc/nginx/conf.d/default.conf
