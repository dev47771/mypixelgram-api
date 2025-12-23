FROM node:20.11-alpine

ARG port
ARG service

ENV SERVICE=$service
ENV PORT=$port

RUN mkdir -p /home/node/app && chown -R node:node /home/node

USER node

# 1️⃣ Корень приложения
WORKDIR /home/node/app

# 2️⃣ Устанавливаем зависимости
COPY --chown=node package*.json ./
RUN npm install --frozen-lockfile

# 3️⃣ Копируем весь проект
COPY --chown=node . .

# 4️⃣ Генерируем Prisma Client
RUN npx prisma generate --schema=./apps/main/prisma/schema.prisma

# 5️⃣ Собираем нужный сервис (main / files-api)
RUN npm run build:${SERVICE}

# 6️⃣ Пробрасываем порт
EXPOSE ${PORT}

# 7️⃣ Проверка + запуск (ВАЖНО)
CMD ["sh", "-c", "echo 'PWD:' && pwd && echo 'DIST CONTENT:' && ls -la dist/apps/main && echo 'STARTING APP' && node dist/apps/main/main.js"]
