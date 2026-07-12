# ── Stage 1: Builder ──────────────────────────────────────────────────────
# Installs all dependencies and copies source for verification.
# Can be extended with test/build steps if needed.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install all dependencies (dev + prod)
RUN npm install --workspace=shared --workspace=backend --ignore-scripts

# Cache-busting: increment when you need to force a fresh build
ARG CACHE_BUST=1

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Fail the build on type errors (runtime uses tsx, so this is the only tsc gate)
RUN cd backend && npx tsc --noEmit

# ── Stage 2: Production ───────────────────────────────────────────────────
# Smaller image with only production dependencies and source files.
FROM node:20-alpine
WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm install --workspace=shared --workspace=backend --omit=dev --ignore-scripts

# Copy source code from builder stage
COPY --from=builder /app/shared/ ./shared/
COPY --from=builder /app/backend/ ./backend/

# Setup app user and uploads directory
RUN apk add --no-cache su-exec \
    && addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

WORKDIR /app/backend

# Ensure entrypoint is executable
COPY --from=builder /app/backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

# Healthcheck: generous start-period allows migrations to complete
# before the container is considered unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

# Migrations run automatically via entrypoint.sh before server starts
CMD ["sh", "entrypoint.sh"]
