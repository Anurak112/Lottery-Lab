# Multi-stage build for Lottery Lab
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
# Use strict install for consistency
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build frontend and server
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
