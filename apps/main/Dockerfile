FROM node:20.11-alpine

ARG port
ARG service

ENV SERVICE=$service
ENV PORT=$port

RUN mkdir -p /home/node/app && chown -R node:node /home/node

USER node

WORKDIR /home/node/app

# 1️⃣ зависимости
COPY --chown=node package*.json ./
RUN npm install --frozen-lockfile

# 2️⃣ код
COPY --chown=node . .

# 3️⃣ prisma
RUN npx prisma generate --schema=./apps/main/prisma/schema.prisma

# 4️⃣ build нужного сервиса
RUN npm run build:${SERVICE}
ENV NODE_ENV=production

EXPOSE ${PORT}

# 5️⃣ запуск
CMD ["sh", "-c", "set -x; node dist/apps/main/main.js; echo EXIT_CODE=$?; sleep 30"]
