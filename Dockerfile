FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS development-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM base AS build-env
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY . .
RUN pnpm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json ./
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
EXPOSE 3000
CMD ["pnpm", "run", "start"]