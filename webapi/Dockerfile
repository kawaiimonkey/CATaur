# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/.env.prod ./.env

CMD ["node", "dist/main"]
