# --- Build stage ---
FROM node:18-slim AS builder
WORKDIR /app
# Install build tools for native dependencies (tailwindcss, postcss, etc.)
# RUN apk add --no-cache python3 make g++ libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm install
# Add environment variables if needed
# ENV VITE_API_URL=https://api.example.com
RUN npm run build

# --- Production stage ---
FROM nginx:alpine
# Clean up to reduce image size
RUN rm -rf /var/cache/apk/*
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]