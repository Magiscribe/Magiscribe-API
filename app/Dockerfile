# Use an official Node runtime as a parent image
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Builds production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml tsconfig.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Builds the application
FROM base AS build
COPY . .
RUN rm -rf node_modules
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

# Runs the application
FROM base
COPY --from=prod-deps /app/package.json /app/pnpm-lock.yaml /app/tsconfig.json /app/
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Set the environment variables unless they are already set
ENV NODE_ENV prod
ENV PORT 8000

# Expose the port the app runs on
EXPOSE $PORT

CMD [ "pnpm", "start" ]