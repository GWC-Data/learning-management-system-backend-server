# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies only
ENV NODE_ENV=production

# Copy built files
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/env/config.js ./env/config.js
COPY --from=builder /usr/src/app/keys/jwks.json ./keys/jwks.json

# Copy .env file (for development)
# For production, use runtime environment variables instead
COPY --from=builder /usr/src/app/.env ./

EXPOSE 8080

CMD ["npm", "run", "start"]