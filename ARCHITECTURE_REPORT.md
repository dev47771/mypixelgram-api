# MyPixelgram API — Architecture Report

Structured report for a new backend developer. All claims reference file paths; no assumptions.

---

## 1) Repository overview

### Top-level folders (from repo root)

| Folder | Purpose (from code/config) |
|--------|----------------------------|
| **apps/** | NestJS monorepo applications: `main`, `files`, `payment`. Defined in `nest-cli.json` (lines 12–40). |
| **node_modules/** | NPM dependencies. |
| **package.json** | Root package: scripts for build/start/test, shared deps (NestJS, Prisma, Sequelize, BullMQ, Stripe, etc.). |
| **nest-cli.json** | Nest CLI config: `monorepo: true`, `projects`: main, files, payment. Source roots and tsconfig paths per app. |
| **eslint.config.mjs** | ESLint config. |
| **tsconfig.build.json** | TypeScript build config. |
| **.dockerignore** | Docker ignore rules. |

**Not present at repo root:** `libs/` (no shared library package found).

### Monorepo

**Yes.** `nest-cli.json` has `"monorepo": true` and three projects:

| App | Role |
|-----|------|
| **main** | HTTP API gateway: auth, users, posts, files proxy, payment proxy, notifications, WebSockets. Consumes RabbitMQ events. Uses PostgreSQL (Prisma) and Redis (BullMQ worker). |
| **files** | TCP microservice: file upload to S3, ownership checks, soft delete, cleanup. Uses MongoDB (Mongoose) and S3. |
| **payment** | TCP microservice: Stripe checkout, webhook handling (via main proxy), subscriptions. Uses MySQL (Sequelize), RabbitMQ (publisher), Redis (BullMQ publisher). |

---

## 2) Applications / services

### Main app

- **Entrypoint:** `apps/main/src/main.ts`
- **Framework/runtime:** NestJS 11, Express (from `@nestjs/platform-express`), CQRS (`@nestjs/cqrs`). Bootstrap: `NestFactory.create`, `app.connectMicroservice(Transport.RMQ)`, `app.useWebSocketAdapter(new IoAdapter(app))`.
- **Started by:**  
  - Dev: `npm run start:dev` → `nest start main --watch` (from `package.json` line 16).  
  - Prod: `npm run start:prod` → `node dist/apps/main/main` (line 21).  
  - Docker: `apps/main/Dockerfile` CMD runs `node dist/apps/main/main.js`.
- **Port:** From env `PORT`. Example: `PORT=3000` in `apps/main/src/env/.env.development`. Used in `apps/main/src/main.ts` (lines 12, 30).

### Files

- **Entrypoint:** `apps/files/src/main.ts`
- **Framework/runtime:** NestJS microservice only: `NestFactory.createMicroservice(..., Transport.TCP)`.
- **Started by:**  
  - Dev: `npm run start:dev:files` (package.json line 17).  
  - Docker: `apps/files/Dockerfile` CMD `node dist/apps/files/main.js`.
- **Port:** Local: `FILES_API_MICROSERVICE_PORT`; non-local: `PORT_FILES_API`. Example: `PORT_FILES_API=3001` in `apps/files/src/env/.env.development`. Set in `apps/files/src/main.ts` (lines 9, 14).

### Payment

- **Entrypoint:** `apps/payment/src/main.ts`
- **Framework/runtime:** NestJS app + TCP microservice: `NestFactory.create(PaymentApiModule)`, then `app.connectMicroservice(Transport.TCP)`. No `app.listen(port)` — HTTP server is commented out; only TCP is used (lines 26–27).
- **Started by:**  
  - Dev: `npm run start:dev:payment` (package.json line 18).  
  - Docker: `apps/payment/Dockerfile` CMD `node dist/apps/payment/main.js`.
- **Port:** TCP: local `PAYMENT_API_MICROSERVICE_PORT`, prod `PAYMENT_TCP_PROD_PORT` (apps/payment/src/main.ts lines 10, 17). HTTP fallback in code: `PORT ?? 3002` (line 26) but `app.listen(port)` is commented out.

---

## 3) Communication between services

### HTTP routes / controllers (main app only; prefix `api/v1` from `apps/main/src/setup/global-prefix.setup.ts`)

| Controller | Path (under api/v1) | File |
|------------|---------------------|------|
| AuthController | auth | `apps/main/src/modules/user-accounts/api/auth.controller.ts` |
| UsersController | users | `apps/main/src/modules/user-accounts/api/users.controller.ts` |
| PublicUsersController | public/users | `apps/main/src/modules/user-accounts/api/public-users.controller.ts` |
| SecurityController | security/devices | `apps/main/src/modules/user-accounts/api/security.controller.ts` |
| PaymentController | payment | `apps/main/src/modules/user-accounts/api/payment.controller.ts` |
| PostController | posts | `apps/main/src/modules/posts/api/post.controller.ts` |
| PublicPostController | public/posts | `apps/main/src/modules/posts/api/public-post.contoller.ts` |
| FilesController | (from FILES_ROUTE) | `apps/main/src/modules/files/api/files.controller.ts` |
| NotificationController | notifications | `apps/main/src/modules/notifications/api/notification.controller.ts` |
| PaymentEventsController | (no HTTP; RMQ only) | `apps/main/src/modules/transport/payment-events.controller.ts` |
| TestingController | (TESTING_ROUTE) | `apps/main/src/modules/testing/testing.controller.ts` |

Route constants: `apps/main/src/modules/user-accounts/domain/constants.ts`.

### Message brokers / queues / schedulers

- **RabbitMQ (main_events):**  
  - **Main app:** Connects as consumer in `apps/main/src/main.ts` (queue `main_events`). Handlers in `apps/main/src/modules/transport/payment-events.controller.ts`: `@EventPattern('subscription.purchased')`, `@EventPattern('subscription.payment_failed')`.  
  - **Payment app:** Publishes via `ClientsModule` name `RABBITMQ_CLIENT` (queue `main_events`) in `apps/payment/src/payment-api.module.ts` (lines 35–44). Outbox publisher: `apps/payment/src/payment/jobs/outbox.scheduler.ts` (cron every 10s, `firstValueFrom(this.rabbitClient.emit(event.type, event.payload))`).

- **BullMQ (Redis):**  
  - **Payment:** Producer only. `NotificationPublisherService` in `apps/payment/src/payment/jobs/subscription.jobs.ts`: creates `Queue` with name from `NOTIFICATIONS_QUEUE` (default `{notifications}`), adds job `subscription.reminder`. Uses `REDIS_*` from ConfigService.  
  - **Main:** Consumer only. `NotificationWorkerService` in `apps/main/src/modules/notifications/jobs/notification.worker.ts`: `Worker` on queue name constant `'{notifications}'`, processes `subscription.reminder` and creates notification + WebSocket push. Redis via `createRedisConnection(configService)` in `apps/main/src/modules/notifications/jobs/create-redis-connection.ts`.

- **Cron/schedulers:**  
  - **Main:** None in the files inspected for cron (only Bull worker).  
  - **Files:** `DeleteFilesScheduler` in `apps/files/src/core/deleteFiles.sheduler.ts`: `@Cron(CronExpression.EVERY_HOUR)`, calls `CleanSoftDeletedFilesUseCase`.  
  - **Payment:** `OutboxScheduler` in `apps/payment/src/payment/jobs/outbox.scheduler.ts`: `@Cron(CronExpression.EVERY_10_SECONDS)`, processes subscription outbox and emits to RabbitMQ. `SubscriptionReminderRecoveryJob` (referenced in payment module) for reminder recovery.

### Shared libraries / modules

- **No `libs/` package:** No shared npm package in repo; each app has its own `src/`.
- **Main → files / payment:** Main calls files and payment via NestJS `ClientProxy` (TCP) in `apps/main/src/modules/transport/transport.service.ts` (injects `FILES_API`, `PAYMENT`). Client config in `apps/main/src/modules/transport/transport.module.ts` (host/port from `FILES_API_HOST`/`FILES_API_PORT`, `PAYMENT_API_HOST`/`PAYMENT_API_PORT` for non-local).
- **Payment:** Uses its own modules only; no import from main or files.

---

## 4) Request flow examples (from code)

### A) POST api/v1/auth/register (registration)

1. **Request:** HTTP POST to global prefix + `auth` + `register` → `AuthController.registerUser` with `RegistrationUserDto` body.  
   - `apps/main/src/modules/user-accounts/api/auth.controller.ts` (lines 48–53).  
   - Route constant: `AUTH_ROUTE = 'auth'` in `apps/main/src/modules/user-accounts/domain/constants.ts`.

2. **Validation:** Global `ValidationPipe` (whitelist, transform, custom exceptionFactory) in `apps/main/src/setup/pipes.setup.ts`. DTO: `apps/main/src/modules/user-accounts/api/input-dto/register-user.input-dto.ts` (class-validator decorators).

3. **Handler:** `commandBus.execute(new RegisterUserCommand(body))`.  
   - Command: `apps/main/src/modules/user-accounts/application/usecases/register-user.use-case.ts` (RegisterUserCommand, RegisterUserUseCase).

4. **Use case:** Builds `CreateUserRepoDto`, generates confirmation code, gets `EMAIL_CONFIRMATION_CODE_LIFETIME_SECS` from ConfigService, calls `usersRepo.createUserWithConfirmation`, then `mailService.sendConfirmationEmail`.  
   - Repo: `apps/main/src/modules/user-accounts/infrastructure/users.repo.ts` (Prisma).  
   - Mail: `apps/main/src/core/mailModule/mail.service.ts`.

5. **Response:** Returns created user id (controller returns result of command; endpoint is `@HttpCode(HttpStatus.NO_CONTENT)` so actual response behavior may be no-content in practice — controller return type is `Promise<string>`).

### B) POST api/v1/auth/login

1. **Request:** POST to auth/login.  
   - `apps/main/src/modules/user-accounts/api/auth.controller.ts` (lines 113–127).

2. **Guard:** `LocalAuthGuard` → Passport local strategy.  
   - Strategy: `apps/main/src/modules/user-accounts/api/guards/local-strategy/local.strategy.ts`: maps to `usernameField: 'email'`, validates with `LoginUserDto`, runs `ValidateUserUseCaseCommand` via CommandBus.

3. **Handler:** After strategy validates, controller runs `commandBus.execute(new LoginUserCommand(dto))`, sets `refreshToken` cookie, returns `{ accessToken }`.  
   - Login use case and token creation are in user-accounts application layer.

### C) POST api/v1/payment/stripe/webhook (Stripe webhook via main)

1. **Request:** POST to `api/v1/payment/stripe/webhook`. Raw body is preserved by `bodyParser.raw({ type: 'application/json' })` registered in `apps/main/src/main.ts` (line 15) for this path only.

2. **Controller:** `PaymentController.stripeWebhook` in `apps/main/src/modules/user-accounts/api/payment.controller.ts` (lines 55–76). Reads `stripe-signature` and `rawBody`, calls `this.transport.handleStripeWebhook({ rawBody, headers })`.

3. **Transport:** `TransportService.handleStripeWebhook` in `apps/main/src/modules/transport/transport.service.ts` (lines 59–65): `this.paymentApiClient.send({ cmd: 'handleStripeWebhook' }, payload)` (TCP to payment microservice).

4. **Payment microservice:** `PaymentApiController.handleStripeWebhook` in `apps/payment/src/payment/api/payment-api.controller.ts` (lines 31–46): builds fake Express `Request` with `body: payload.rawBody`, `headers: payload.headers`, then `this.webhookService.handle(fakeReq)`.

5. **Webhook service:** `StripeWebhookService.handle` in `apps/payment/src/payment/application/stripe-webhook.service.ts`: verifies with `STRIPE_WEBHOOK_SECRET`, handles `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`/`payment_intent.payment_failed`; updates DB (PaymentRepo, SubscriptionRepo), writes outbox events; for success path calls `NotificationPublisherService.scheduleSubscriptionReminder` (BullMQ).

6. **Response:** Main returns `res.status(200).json({ received: true })` or 400 on error.

### D) POST api/v1/posts (create post)

1. **Request:** POST to posts, JWT guard, body `CreateInputDto` (includes `filesId`).  
   - `apps/main/src/modules/posts/api/post.controller.ts` (lines 33–37).

2. **Guard:** `JwtAuthGuard` (JWT strategy from ConfigService `JWT_SECRET_KEY`).  
   - `apps/main/src/modules/user-accounts/api/guards/jwt-strategy/jwt.strategy.ts`.

3. **Handler:** `commandBus.execute(new CreatePostCommand(createPostDto, dto.userId))`.  
   - Use case: `apps/main/src/modules/posts/application/create-post.use-case.ts`.

4. **Use case:** Calls `transportService.verifyFileOwnership({ filesId, userId })` (TCP to files `checkFileOwner`), then `postRepo.createPost(...)`.  
   - Transport: `apps/main/src/modules/transport/transport.service.ts` (lines 24–31).  
   - Files: `apps/files/src/files/api/files.controller.ts` `@MessagePattern({ cmd: 'checkFileOwner' })`.

5. **Response:** Controller returns `await this.postQueryRepo.getPostViewById(postId)` (post view by id).

---

## 5) Data layer & integrations

### Databases

- **Main app — PostgreSQL (Prisma):**  
  - Schema: `apps/main/prisma/schema.prisma` (datasource `env("DATABASE_URL")`, shadow `env("SHADOW_DATABASE_URL")`).  
  - Client: `apps/main/src/core/prisma/prisma.service.ts` (extends PrismaClient).  
  - Migrations: `apps/main/prisma/migrations/` (e.g. `20250916080723_first_migrate`, `20260205114910_add_notifications`).  
  - Commands: `main:prisma:migrate:dev`, `main:prisma:deploy`, etc. in `package.json` (lines 27–36).

- **Files — MongoDB (Mongoose):**  
  - Connection: `MongooseModule.forRootAsync` in `apps/files/src/files.module.ts` (uri: `MONGO_URL`/`DB_NAME`).  
  - Schema: `FileSchema` in `apps/files/src/files/domain/file.schema.ts` (referenced in module).  
  - Repo: `apps/files/src/files/infrastructure/files.repo.ts`.

- **Payment — MySQL (Sequelize):**  
  - Config: `apps/payment/config/config.js` (dialect `mysql`, `process.env.DATABASE_URL`).  
  - Models: `PaymentModel`, `SubscriptionModel` in `apps/payment/src` (referenced in `payment-api.module.ts`).  
  - Migrations: `apps/payment/migrations/` (e.g. `20251226201040-create-payments.js`).  
  - CLI: `payment:migrate` in package.json (line 38) uses `sequelize-cli` with `apps/payment/config/config.js`, `apps/payment/migrations`.

### Caches

- **Redis:** Used for BullMQ only (no separate cache-manager usage found in the flows above).  
  - Main: `createRedisConnection` in `apps/main/src/modules/notifications/jobs/create-redis-connection.ts` (REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_TLS_ENABLED).  
  - Payment: `NotificationPublisherService` in `apps/payment/src/payment/jobs/subscription.jobs.ts` (same REDIS_* + NOTIFICATIONS_QUEUE).  
  - `@nestjs/cache-manager` and `cache-manager` are in package.json but not referenced in the code paths above.

### External APIs

- **Stripe:** Used in payment app: `apps/payment/src/payment/application/stripe-checkout.service.ts` (Stripe SDK, `STRIPE_SECRET_KEY`), `apps/payment/src/payment/application/stripe-webhook.service.ts` (webhook verify with `STRIPE_WEBHOOK_SECRET`).
- **S3-compatible (Yandex):** files: `apps/files/src/core/s3storageAdapter.ts` (BUCKET_NAME, BUCKET_ENDPOINT, BUCKET_REGION, BUCKET_ACCESS_KEY_ID, BUCKET_SECRET_ACCESS_KEY).
- **reCAPTCHA:** Main: `apps/main/src/modules/user-accounts/application/recaptcha.service.ts` (RECAPTCHA_SECRET_KEY).
- **SMTP (mail):** Main: `apps/main/src/core/mailModule/mail.module.ts` (MAIL_MODULE_HOST, USER, PASSWORD, FROM). Templates under `apps/main/src/core/mailModule/templates/` (e.g. `recoveryCode.hbs`).
- **OAuth:** Main: Google and GitHub Passport strategies in `apps/main/src/modules/user-accounts/api/guards/` (GOOGLE_*, GITHUB_* env).

---

## 6) Configuration & local run

### Env variables (referenced in code or config)

**Main app (and deployment/env files):**  
From `apps/main/src/core/env.validation.ts`: NODE_ENV, PORT, DATABASE_URL, EMAIL_CONFIRMATION_CODE_LIFETIME_SECS, INCLUDE_TESTING_MODULE, JWT_SECRET_KEY, DB_LOGGING, MAIL_MODULE_HOST, MAIL_MODULE_USER, MAIL_MODULE_PASSWORD, MAIL_MODULE_FROM.  
From usage and `apps/main/src/env/.env.development`, `apps/main/deployment.yaml`: RABBITMQ_URL, RECOVERY_URL, REGISTRATION_URL, PASSWORD_RECOVERY_CODE_LIFETIME_SECS, RECAPTCHA_SECRET_KEY, GITHUB_CLIENT_ID/SECRET/CALLBACK_URL, GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL, URL_TOKEN_SUCCESS, URL_TOKEN_ERROR, FRONT_PROFILE_URL, FRONT_SIGNIN_ERROR_URL, JWT_EXPIRES_IN, FILES_API_HOST, FILES_API_PORT, PAYMENT_API_HOST, PAYMENT_API_PORT, MONGO_URL, BUCKET_*, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_TLS_ENABLED, SHADOW_DB_URL (or SHADOW_DATABASE_URL).  
Testing: DATABASE_URL, HTTP_BASIC_USER, HTTP_BASIC_PASS (e.g. in `apps/main/test/e2e/features/auth/auth.e2e-spec.ts`).

**Files:**  
From `apps/files/src/core/env.validation.ts`: NODE_ENV, PORT_FILES_API (optional), BUCKET_NAME, BUCKET_SECRET_ACCESS_KEY, BUCKET_ACCESS_KEY_ID, BUCKET_ENDPOINT, BUCKET_REGION, DB_NAME (optional), MONGO_URL.  
Local TCP port: FILES_API_MICROSERVICE_PORT (used in main.ts, not in files validation).

**Payment:**  
From `apps/payment/src/core/env.validation.ts`: NODE_ENV, PAYMENT_API_MICROSERVICE_PORT, PORT.  
From code: DATABASE_URL (payment DB), RABBITMQ_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PAYMENT_SUCCESS_URL, PAYMENT_ERROR_URL, STRIPE_PRICE_DAY/WEEK/MONTH/YEAR (plans.config.ts), REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_USERNAME, REDIS_TLS_ENABLED, NOTIFICATIONS_QUEUE. PAYMENT_TCP_PROD_PORT in main.ts for prod.

**Env file resolution:**  
Main: `apps/main/src/env-file-paths.ts` (serviceRoot = `apps/main/src/env`), then `.env.${NODE_ENV}.local`, `.env.${NODE_ENV}`, `.env`, plus optional ENV_FILE_PATH.

### Docker

- **apps/main/Dockerfile:** Builds with `ARG service`, `ARG port`; runs `npm run build:${SERVICE}`, always runs `node dist/apps/main/main.js` (SERVICE/port not used in CMD). Also runs `npx prisma generate --schema=./apps/main/prisma/schema.prisma`.
- **apps/files/Dockerfile:** Builds `files`, CMD `node dist/apps/files/main.js`.
- **apps/payment/Dockerfile:** Builds `payment`, CMD `node dist/apps/payment/main.js`.
- **apps/main/docker-compose.yml:** Postgres 15, DB `develop-db`, user/password, port 5432, volume, init scripts from `./init-scripts`. Healthcheck uses `pg_isready -U myuser -d myapp` (does not match POSTGRES_USER/POSTGRES_DB in same file — see gotchas).
- **apps/payment/docker-compose.yml:** MySQL 8, root password, DB `payments_dev`, user `payments`, port 3307:3306.

### K8s

- **apps/main/deployment.yaml:** Deployment template (DEPLOYMENT_NAME, NAMESPACE, PROJECT, REGISTRY_HOSTNAME, TAG_VERSION, PORT_CONTAINER). Env from secret `mypixelgram-main-api-production-config-secret` (long list including DB, mail, OAuth, FILES_API_*, PAYMENT_API_*, RABBITMQ_URL, REDIS_*, etc.).
- **apps/files/deployment.yaml**, **apps/payment/deployment.yaml:** Present (not fully read; payment references PAYMENT_API_MICROSERVICE_PORT from secret).

### Commands to run locally (from package.json)

- Main: `npm run start:dev` (NODE_ENV=development.local, main with watch).
- Files: `npm run start:dev:files`.
- Payment: `npm run start:dev:payment`.
- E2E: `npm run test:e2e` (uses `./apps/main/src/env/.env.testing`, resets test DB, then jest e2e).
- Main DB: `npm run main:prisma:reset`, `main:prisma:migrate:dev`, `main:prisma:generate` (with `.env.development.local`).
- Payment DB: `npm run payment:migrate` (sequelize-cli, development env).
- Bull board: `npm run start-bull` → `node dist/apps/main/src/modules/notifications/bull-board.js` (source file for bull-board not found in repo).

---

## 7) Risks / gotchas (evidence-based)

- **Secrets in env files:** `apps/main/src/env/.env.development` and `apps/main/src/env/.env.testing` contain plaintext mail passwords, OAuth client secrets, reCAPTCHA secret, DB URLs. These should not be committed or must be in .gitignore.  
  - Files: `apps/main/src/env/.env.development`, `apps/main/src/env/.env.testing`.

- **Main app env validation incomplete:** `apps/main/src/core/env.validation.ts` does not require RABBITMQ_URL, REDIS_*, FILES_API_*, PAYMENT_API_*, RECOVERY_URL, REGISTRATION_URL, OAuth/recaptcha keys, etc. Missing or wrong env will fail at runtime.  
  - File: `apps/main/src/core/env.validation.ts`.

- **Payment env validation incomplete:** `apps/payment/src/core/env.validation.ts` only validates NODE_ENV, PAYMENT_API_MICROSERVICE_PORT, PORT. DATABASE_URL, RABBITMQ_URL, STRIPE_*, REDIS_*, NOTIFICATIONS_QUEUE are used but not validated.  
  - File: `apps/payment/src/core/env.validation.ts`; usage e.g. in `payment-api.module.ts`, `stripe-webhook.service.ts`, `subscription.jobs.ts`, `plans.config.ts`.

- **Docker Compose healthcheck mismatch (main):** `apps/main/docker-compose.yml` healthcheck runs `pg_isready -U myuser -d myapp` but environment sets POSTGRES_USER=postgres, POSTGRES_DB=develop-db. Healthcheck may always fail.  
  - File: `apps/main/docker-compose.yml` (lines 18–22 vs 6–11).

- **Main Dockerfile CMD ignores SERVICE:** CMD is hardcoded to `node dist/apps/main/main.js`. Building with `--build-arg service=files` still runs main.  
  - File: `apps/main/Dockerfile` (line 29).

- **Stripe webhook raw body:** Main must preserve raw body for signature verification. It does so only for `/api/v1/payment/stripe/webhook` via `bodyParser.raw(...)`. If order of middleware or path changes, verification can break.  
  - File: `apps/main/src/main.ts` (line 15).

- **Notification queue name duplication:** Payment uses `NOTIFICATIONS_QUEUE` from config (default `{notifications}`); main worker uses hardcoded `'{notifications}'` in `apps/main/src/modules/notifications/jobs/notification.worker.ts` (line 8). If payment sets NOTIFICATIONS_QUEUE to something else, main will not process those jobs.  
  - Files: `apps/payment/src/payment/jobs/subscription.jobs.ts`, `apps/main/src/modules/notifications/jobs/notification.worker.ts`.

- **Payment HTTP server disabled:** `apps/payment/src/main.ts` has `app.listen(port)` commented out. Stripe webhooks must go through main’s `/api/v1/payment/stripe/webhook`; no direct HTTP to payment.  
  - File: `apps/payment/src/main.ts` (lines 25–27).

- **TransportService closes client after each call:** `this.filesApiClient.close()` and `this.paymentApiClient.close()` are called after firstValueFrom in `apps/main/src/modules/transport/transport.service.ts`. Repeated calls may reopen connections; consider keeping connection open or connection pooling.  
  - File: `apps/main/src/modules/transport/transport.service.ts` (e.g. lines 17–18, 30–31).

- **Bull board script:** `npm run start-bull` points to `dist/apps/main/src/modules/notifications/bull-board.js`. No source file `bull-board.ts` (or .js) found under that path in the repo; script may be broken unless added elsewhere.  
  - File: `package.json` (line 42).

- **Prisma DB logging commented out:** `apps/main/src/core/prisma/prisma.service.ts` has log option commented; harder to debug DB issues.  
  - File: `apps/main/src/core/prisma/prisma.service.ts` (lines 8–12).

- **Recaptcha guard disabled on register:** Auth controller has `//@UseGuards(RecaptchaGuard)` on register endpoint; recaptcha is not enforced.  
  - File: `apps/main/src/modules/user-accounts/api/auth.controller.ts` (line 49).

---

*End of report. All paths are relative to the repository root.*
