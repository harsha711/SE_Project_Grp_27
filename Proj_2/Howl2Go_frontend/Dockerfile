# Frontend Dockerfile for Howl2Go (Next.js)
# Use a current LTS (18 works, but 20/22 is recommended)
FROM node:22-alpine AS base
# If you use sharp/native modules with Next Image:
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# Disable husky during Docker builds (if you use it)
ENV HUSKY=0
COPY package*.json ./
# Install with dev deps because TypeScript/linters may be needed at build
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure standalone output is enabled in next.config.* (output: 'standalone')
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy minimal runtime artifacts
COPY --from=builder /app/public ./public
# Standalone contains server.js and the minimal node_modules required at runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# server.js is at the root of the standalone bundle we copied above
CMD ["node", "server.js"]
