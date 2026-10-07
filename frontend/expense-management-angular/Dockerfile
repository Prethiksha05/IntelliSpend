# ======================================================
# Angular Frontend Dockerfile
# IntelliSpend — Frontend
# Multi-stage: Node build → Nginx serve
# ======================================================

# ---- Build Stage ----
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# ---- Runtime Stage ----
FROM nginx:alpine

LABEL maintainer="IntelliSpend Team"
LABEL description="IntelliSpend Angular Frontend"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=builder /app/dist/expense-management-angular/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
