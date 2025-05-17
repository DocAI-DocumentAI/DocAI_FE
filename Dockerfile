# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app
# Install build tools for native dependencies (if needed)
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# --- Production stage ---
FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]