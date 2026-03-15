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

CMD ["npm", "start"]
