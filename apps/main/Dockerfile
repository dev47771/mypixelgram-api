FROM node:20.11-alpine

ARG port
ARG service

ENV SERVICE=$service
ENV PORT=$port

RUN mkdir -p /home/node/app && chown -R node:node /home/node

USER node

WORKDIR /home/node/app


COPY --chown=node package*.json ./
RUN npm install --frozen-lockfile

COPY --chown=node . .

RUN npx prisma generate --schema=./apps/main/prisma/schema.prisma

RUN npm run build:${SERVICE}
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["sh", "-c", "set -x; node dist/apps/main/main.js; echo EXIT_CODE=$?; sleep 30"]
