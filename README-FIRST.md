# MyPixelgram API — краткое README (handover)

Этот репозиторий — **NestJS monorepo** с **3 приложениями**: `main`, `files-api`, `payment`.

---

## 1) Что где находится

- `apps/` — приложения монорепо:
    - `apps/main` — основной **HTTP API** (gateway) + WebSocket + consumer RabbitMQ + worker BullMQ
    - `apps/files-api` — **TCP microservice** для файлов (S3 + MongoDB) + hourly cleanup
    - `apps/payment` — **TCP microservice** для платежей Stripe (MySQL) + RabbitMQ outbox + BullMQ producer
- `nest-cli.json` — конфиг Nest monorepo (3 проекта)
- `package.json` — общие скрипты запуска/сборки/миграций
- `ARCHITECTURE_REPORT.md` — полный архитектурный отчёт с путями файлов



---

## 2) Приложения

### main (HTTP API)
- **Entrypoint:** `apps/main/src/main.ts`
- **HTTP prefix:** `api/v1` (`apps/main/src/setup/global-prefix.setup.ts`)
- **Функции:** auth/users/posts/notifications/WebSockets, проксирование в `files-api` и `payment` по TCP, consumer RabbitMQ, BullMQ worker.
- **Порт:** из `PORT` (пример: `apps/main/src/env/.env.development`)
- **Запуск:**
    - dev: `npm run start:dev` → `nest start main --watch`
    - prod: `npm run start:prod` → `node dist/apps/main/main`

### files-api (TCP microservice)
- **Entrypoint:** `apps/files-api/src/main.ts`
- **Функции:** загрузка файлов в S3, ownership checks, soft-delete + очистка.
- **Порт:** `FILES_API_MICROSERVICE_PORT` (local) / `PORT_FILES_API` (env)
- **Запуск:**
    - dev: `npm run start:dev:files-api`
    - prod: `node dist/apps/files-api/main.js`

### payment (TCP microservice)
- **Entrypoint:** `apps/payment/src/main.ts`
- **Функции:** Stripe checkout + обработка webhook (через main), подписки, outbox в RabbitMQ, job-ы в BullMQ.
- **Важно:** HTTP сервер **выключен** (`app.listen` закомментирован). Webhook приходит в **main**, а main проксирует в payment по TCP.
- **Порт (TCP):** `PAYMENT_API_MICROSERVICE_PORT` (local) / `PAYMENT_TCP_PROD_PORT` (prod)
- **Запуск:**
    - dev: `npm run start:dev:payment`
    - prod: `node dist/apps/payment/main.js`

---

## 3) Взаимодействие между сервисами

### TCP (NestJS clients)
- **main → files-api**: проверки ownership и операции с файлами
    - клиент/вызовы: `apps/main/src/modules/transport/transport.service.ts`
    - конфиг: `apps/main/src/modules/transport/transport.module.ts`
- **main → payment**: checkout и обработка webhook
    - `apps/main/src/modules/transport/transport.service.ts`

### RabbitMQ
- Очередь: **`main_events`**
- **payment публикует** события (outbox):
    - клиент: `apps/payment/src/payment-api.module.ts`
    - планировщик outbox: `apps/payment/src/payment/jobs/outbox.scheduler.ts`
- **main потребляет**:
    - `apps/main/src/main.ts` (подключение RMQ)
    - обработчики: `apps/main/src/modules/transport/payment-events.controller.ts`
        - `subscription.purchased`
        - `subscription.payment_failed`

### BullMQ (Redis)
- Очередь: по умолчанию **`{notifications}`**
- **payment — producer** (создаёт job `subscription.reminder`):
    - `apps/payment/src/payment/jobs/subscription.jobs.ts`
- **main — worker** (обрабатывает job и шлёт нотификации/WS):
    - `apps/main/src/modules/notifications/jobs/notification.worker.ts`

---

## 4) Данные (БД/сторадж)

- **main → PostgreSQL (Prisma)**
    - schema: `apps/main/prisma/schema.prisma`
    - prisma service: `apps/main/src/core/prisma/prisma.service.ts`
    - migrations: `apps/main/prisma/migrations/`
- **files-api → MongoDB (Mongoose) + S3**
    - mongo connect: `apps/files-api/src/files-api.module.ts`
    - s3 adapter: `apps/files-api/src/core/s3storageAdapter.ts`
- **payment → MySQL (Sequelize)**
    - sequelize config: `apps/payment/config/config.js`
    - migrations: `apps/payment/migrations/`

---

## 5) Основные входные точки (HTTP main)

HTTP routes (под `api/v1`):
- auth: `apps/main/src/modules/user-accounts/api/auth.controller.ts`
- users: `apps/main/src/modules/user-accounts/api/users.controller.ts`
- posts: `apps/main/src/modules/posts/api/post.controller.ts`
- files: `apps/main/src/modules/files/api/files.controller.ts`
- notifications: `apps/main/src/modules/notifications/api/notification.controller.ts`
- payment: `apps/main/src/modules/user-accounts/api/payment.controller.ts`

---

## 6) Быстрый запуск (локально)

### Команды (из `package.json`)
- main (dev): `npm run start:dev`
- files-api (dev): `npm run start:dev:files-api`
- payment (dev): `npm run start:dev:payment`

### Миграции
- main / prisma:
    - `npm run main:prisma:migrate:dev`
    - `npm run main:prisma:deploy`
    - `npm run main:prisma:generate`
- payment / sequelize:
    - `npm run payment:migrate`

### Docker / K8s
- Dockerfiles:
    - `apps/main/Dockerfile`
    - `apps/files-api/Dockerfile`
    - `apps/payment/Dockerfile`
- Compose:
    - `apps/main/docker-compose.yml` (Postgres)
    - `apps/payment/docker-compose.yml` (MySQL)
- K8s manifests:
    - `apps/main/deployment.yaml`
    - `apps/files-api/deployment.yaml`
    - `apps/payment/deployment.yaml`

---

## 7) Env (что точно используется)

Полные списки и где используются — см. `ARCHITECTURE_REPORT.md`.

Базово по сервисам:
- **main**: `PORT`, `DATABASE_URL` (+ shadow), `JWT_SECRET_KEY`, mail env, OAuth/reCAPTCHA, `RABBITMQ_URL`, `REDIS_*`, `FILES_API_*`, `PAYMENT_API_*`
- **files-api**: `MONGO_URL`, `DB_NAME`, `BUCKET_*`, `PORT_FILES_API` / `FILES_API_MICROSERVICE_PORT`
- **payment**: `DATABASE_URL`, `RABBITMQ_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `REDIS_*`, `NOTIFICATIONS_QUEUE`, `PAYMENT_API_MICROSERVICE_PORT`

---

## 8) Важные замечания / gotchas (из кода)

- **В репо лежат секреты в env**:  
  `apps/main/src/env/.env.development`, `apps/main/src/env/.env.testing`
- **Env validation не покрывает всё**:
    - main: `apps/main/src/core/env.validation.ts`
    - payment: `apps/payment/src/core/env.validation.ts`
- **Docker healthcheck mismatch (main)**: `apps/main/docker-compose.yml`
- **main Dockerfile CMD всегда запускает main**: `apps/main/Dockerfile`
- **BullMQ queue name**:  
  payment берёт `NOTIFICATIONS_QUEUE` (default `{notifications}`), а main worker использует хардкод `'{notifications}'`
    - `apps/payment/src/payment/jobs/subscription.jobs.ts`
    - `apps/main/src/modules/notifications/jobs/notification.worker.ts`
- **TransportService закрывает TCP client после каждого вызова**:
    - `apps/main/src/modules/transport/transport.service.ts`
- **Stripe webhook зависит от raw body** (в main настроено только на этот путь):
    - `apps/main/src/main.ts` (`bodyParser.raw(...)`)
- **reCAPTCHA guard на register отключён**:
    - `apps/main/src/modules/user-accounts/api/auth.controller.ts`

---

## 9) Где смотреть подробности

- Полный отчёт (с путями файлов и request flows): **`ARCHITECTURE_REPORT.md`**