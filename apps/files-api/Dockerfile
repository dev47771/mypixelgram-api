FROM node:20.11-alpine

ARG port
ARG service

ENV SERVICE=$service
ENV PORT=$port
ENV PORT_FILES_API=$port

RUN mkdir -p /home/node/app && chown -R node:node /home/node

USER node
WORKDIR /home/node/app

# deps
COPY --chown=node package*.json ./
RUN npm install --frozen-lockfile

# code
COPY --chown=node . .

# build
RUN npm run build:${SERVICE}

# runtime
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "dist/apps/files-api/main.js"]
