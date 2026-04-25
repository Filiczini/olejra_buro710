FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=shared --workspace=backend --ignore-scripts

COPY shared/ ./shared/
COPY backend/ ./backend/

EXPOSE 3000

WORKDIR /app/backend

COPY backend/entrypoint.sh /app/backend/entrypoint.sh
RUN chmod +x /app/backend/entrypoint.sh

RUN apk add --no-cache su-exec \
    && addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

CMD ["sh", "entrypoint.sh"]
