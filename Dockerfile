# Production Dockerfile for Obsolete Sector Indie Hub
FROM node:20-alpine

WORKDIR /app

# Install build tools for native SQLite bindings
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure data and upload directories exist
RUN mkdir -p data uploads/games uploads/images

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
