# Stage 1: Build
FROM node:20-alpine AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL


ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copy root package.json for workspaces
COPY package*.json ./

# Copy shared package
COPY shared/package*.json ./shared/

# Copy frontend package
COPY frontend/package*.json ./frontend/

# Install all dependencies (including shared workspace)
# --ignore-scripts skips husky prepare script
RUN npm install --workspace=shared --workspace=frontend --ignore-scripts

# Copy source files
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build frontend
RUN npm run build --workspace=frontend

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY --from=builder /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
