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

# 4. Copy all source files (including config)
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

# ✅ Copy config and keys
COPY --from=builder /usr/src/app/env/config.js ./env/config.js  
COPY src/config/key.json ./config/key.json

COPY --from=builder /usr/src/app/keys/jwks.json ./keys/jwks.json

# Required environment variables
ENV PORT=8080 \
    SECONDARY_PORT=8081 \
    ACCESS_TOKEN_AUDIENCE=domo \
    ACCESS_TOKEN_ISSUER=gwc \
    ADMIN_API_ACCESS_TOKEN_AUDIENCE=domo \
    ADMIN_ACCESS_TOKEN_ISSUER=authservice \
    ADMIN_API_ECDSA_PUBLIC_KEY=Test \
    DB_MIGRATION=false \
    DEBUG="" \
    PROJECT_ID=teqcertify \
    DATASET_ID=lms

EXPOSE 8080

# Use npm run start with proper signal handling
CMD ["npm", "run", "start"]
