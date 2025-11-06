# Backend Dockerfile for Howl2Go
FROM node:22-alpine

# Set production mode early so npm and frameworks can optimize
ENV NODE_ENV=production
ENV PORT=4000

# Set working directory
WORKDIR /app

# Install dependencies with caching
COPY package*.json ./
# Exact, reproducible deps; omit dev deps for a smaller image
RUN npm ci --omit=dev --ignore-scripts

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Health check (slightly more lenient timing)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Drop root privileges
USER node

# Start the application
CMD ["npm", "start"]
