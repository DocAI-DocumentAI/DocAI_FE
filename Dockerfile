# --- Build stage ---
FROM node:20.19.2 AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package.json package-lock.json ./

# Remove node_modules and package-lock.json, then reinstall dependencies
RUN npm ci --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Run the build
RUN npm run build

# --- Production stage ---
FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]