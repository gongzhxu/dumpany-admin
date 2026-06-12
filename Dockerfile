# Build frontend
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --loglevel verbose
COPY . .
RUN ./node_modules/.bin/tsc -b --listFiles 2>&1 && ./node_modules/.bin/vite build --debug 2>&1

# Serve with nginx
FROM nginx:alpine
RUN apk add -v --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
