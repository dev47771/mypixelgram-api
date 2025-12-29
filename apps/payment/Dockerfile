FROM node:20.11-alpine

ARG port
ARG service

ENV SERVICE=$service
ENV PORT=$port

RUN mkdir -p /home/node/app && chown -R node:node /home/node

USER node
WORKDIR /home/node/app


COPY --chown=node package*.json ./
RUN npm install

COPY --chown=node . .

RUN npm run build:${SERVICE}

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "dist/apps/payment/main.js"]
