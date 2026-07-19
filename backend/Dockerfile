FROM node:20-alpine

ARG AS6_RELEASE_SHA=development
LABEL org.opencontainers.image.revision=$AS6_RELEASE_SHA

WORKDIR /app

ENV NODE_ENV=production
ENV AS6_RELEASE_SHA=$AS6_RELEASE_SHA

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY . .

USER node

CMD ["npm", "start"]
