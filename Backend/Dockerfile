# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project (produces dist/ folder)
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Command to start the server
CMD ["node", "dist/server.js"]
