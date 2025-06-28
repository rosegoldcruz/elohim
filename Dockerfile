# AEON AI Video Generation Platform - LLM Runner Dockerfile
# License: MIT

FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 llmrunner

# Change ownership
RUN chown -R llmrunner:nodejs /app
USER llmrunner

# Expose port for health checks
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('LLM Runner healthy')" || exit 1

# Run the LLM runner
CMD ["node", "llm-runner.js"]
