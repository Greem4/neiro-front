FROM node:20-alpine as builder

WORKDIR /app
COPY . .

# устанавливаем всё, включая dev-зависимости
RUN npm install

# запускаем vite билд через npx
RUN npx vite build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
