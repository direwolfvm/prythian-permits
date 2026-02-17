# syntax=docker/dockerfile:1

# Build stage: install dependencies and compile the Vite app
FROM node:22-alpine AS build
WORKDIR /usr/src/app

# Build-time args so Vite can inline VITE_* vars into the client bundle
ARG VITE_COPILOTKIT_PUBLIC_API_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_COPILOTKIT_PUBLIC_API_KEY=$VITE_COPILOTKIT_PUBLIC_API_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Install production and development dependencies to build the app
COPY app/package*.json ./
RUN npm ci

# Copy the source code and produce the production build
COPY app/ ./
RUN npm run build

# Production image: copy the build output and only production dependencies
FROM node:22-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install only the production dependencies
COPY app/package*.json ./
RUN npm ci --omit=dev

# Copy the compiled assets, server code, and the Express server entry point
COPY --from=build /usr/src/app/dist ./dist
COPY app/server ./server
COPY app/server.mjs ./server.mjs

EXPOSE 8080
CMD ["node", "server.mjs"]
