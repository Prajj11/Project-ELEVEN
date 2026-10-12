FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN npm install

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build shared & server
RUN npm run build -w packages/shared
RUN npm run build -w apps/server

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json

EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
