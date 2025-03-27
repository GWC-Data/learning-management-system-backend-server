# Stage 1: Build environment
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# 1. Install system dependencies
RUN apk add --no-cache python3 make g++ git

# 2. Copy package files first for better caching
COPY package*.json ./
COPY tsconfig*.json ./

# 3. Install all dependencies including types
RUN npm install --include=dev
RUN npm install date-fns @types/date-fns --save-dev

# 4. Copy all source files (excluding .env in production)
COPY . .

# 5. Run build
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies only
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Health check (adjust to your application's health endpoint)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Default environment variables (override in Cloud Run)
ENV PORT=8080 \
    SECONDARY_PORT=5051 \
    DEBUG= \
    DB_MIGRATION=false

# For development, you could optionally copy .env (not recommended for production)
# COPY --from=builder /usr/src/app/.env .env

EXPOSE 8080
CMD ["node", "dist/index.js"]