# Stage 1: Build environment
FROM node:18-alpine as build-stage  

WORKDIR /usr/src/app

# 1. Install system dependencies
RUN apk add --no-cache python3 make g++ git

# 2. Copy package files first for better caching
COPY package*.json ./  
COPY tsconfig*.json ./  

# 3. Install all dependencies including types
RUN npm install --include=dev
RUN npm install date-fns @types/date-fns --save-dev

# 4. Copy all source files
COPY . .

# 5. Run build
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies only
ENV NODE_ENV=production

# Copy necessary files from build-stage
COPY --from=build-stage /usr/src/app/package*.json ./  
COPY --from=build-stage /usr/src/app/node_modules ./node_modules  
COPY --from=build-stage /usr/src/app/dist ./dist  

# Copy configuration files (ensure these exist in your project)
COPY --from=build-stage /usr/src/app/env/config.js ./env/config.js  
COPY --from=build-stage /usr/src/app/keys/jwks.json ./keys/jwks.json

EXPOSE 8080

CMD ["npm", "run", "start"]