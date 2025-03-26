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

# 4. Copy all source files
COPY . .

# 5. Run build
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5050
CMD ["node", "dist/index.js"]