FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs generation.mjs sources.mjs tweet-images.mjs usage-limits.mjs ./
COPY public/ ./public/
RUN mkdir -p /var/data && chown node:node /var/data
USER node
CMD ["node", "server.mjs"]
