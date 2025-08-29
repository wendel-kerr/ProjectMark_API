# ---- builder ----
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# ---- runtime ----
FROM node:18-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# ONLY RUNTIME DEPS (NO DEV): AVOIDS glob@7/inflight COMING FROM DEV TOOLS
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]