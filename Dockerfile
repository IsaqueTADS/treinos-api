FROM node:24-slim AS base

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

# Dependencies
FROM base AS deps
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

# Build
FROM deps AS build
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# Production
FROM base AS production
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/dist ./dist

CMD ["node", "dist/src/index.js"]