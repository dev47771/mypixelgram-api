# Frontend Integration Plan

## Для человека

### Цель

Нужно добавить отдельный frontend-проект и запускать его отдельным `docker-compose.yml`.

Backend уже живет в своем compose:

```bash
docker compose up --build
```

Frontend должен жить отдельно, например:

```text
mypixelgram-api/
  docker-compose.yml              # backend + rabbitmq
  frontend/
    docker-compose.yml            # frontend + nginx
    Dockerfile
    nginx.conf
    package.json
    src/
```

### Базовый frontend

Лучший старт:

```bash
npx create-next-app@latest frontend
```

Рекомендуемые ответы:

```text
TypeScript: yes
ESLint: yes
Tailwind: optional
App Router: yes
src directory: yes
Turbopack: optional
Import alias: yes
```

Если нужен чистый React без SSR:

```bash
npm create vite@latest frontend -- --template react-ts
```

Но для проекта лучше Next.js: маршруты, auth pages, SEO, image handling, middleware.

### Как frontend должен ходить в backend

В браузере frontend должен обращаться не напрямую к контейнеру `main`, а через nginx:

```text
browser -> nginx -> frontend
browser -> nginx /api -> backend main
```

Пример публичных путей:

```text
http://localhost/              -> frontend
http://localhost/api/v1/...    -> backend main:3000/api/v1/...
```

Так проще:

- не нужен CORS между frontend/backend
- cookies работают предсказуемо
- OAuth callback можно держать на одном домене
- на сервере будет один входной порт `80`/`443`

### Frontend docker-compose.yml

Frontend compose должен поднимать:

- `frontend` - Next.js app
- `nginx` - reverse proxy

Пример:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: /api
    expose:
      - "3000"
    restart: unless-stopped
    networks:
      - frontend-network
      - mypixelgram-network

  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
    restart: unless-stopped
    networks:
      - frontend-network
      - mypixelgram-network

networks:
  frontend-network:
    driver: bridge
  mypixelgram-network:
    external: true
```

Важно: backend compose network должен иметь стабильное имя:

```yaml
networks:
  mypixelgram-network:
    name: mypixelgram-network
    driver: bridge
```

Иначе Docker Compose создаст имя вида `mypixelgram-api_mypixelgram-network`, и frontend compose не сможет удобно подключиться.

### nginx.conf

Пример:

```nginx
server {
  listen 80;
  server_name _;

  client_max_body_size 50m;

  location /api/ {
    proxy_pass http://main:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /socket.io/ {
    proxy_pass http://main:3000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }

  location / {
    proxy_pass http://frontend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Next.js Dockerfile

Пример:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Локальный запуск двух compose

Сначала backend:

```bash
docker compose up --build -d
```

Потом frontend:

```bash
cd frontend
docker compose up --build -d
```

Проверить:

```bash
docker ps
curl http://localhost
curl http://localhost/api/v1
```

RabbitMQ UI:

```text
http://localhost:15672
login: guest
password: guest
```

### Запуск на сервере

1. Установить Docker и Docker Compose plugin.
2. Склонировать backend repo на сервер.
3. Склонировать или положить frontend в отдельную папку.
4. Поднять backend compose.
5. Поднять frontend compose.
6. Проверить, что nginx из frontend compose видит backend service `main`.
7. Настроить домен на IP сервера.
8. Добавить HTTPS через внешний nginx, Caddy, Traefik или certbot.

Пример структуры на сервере:

```text
/opt/mypixelgram/
  backend/
    docker-compose.yml
  frontend/
    docker-compose.yml
    nginx.conf
```

Команды:

```bash
cd /opt/mypixelgram/backend
docker compose up --build -d

cd /opt/mypixelgram/frontend
docker compose up --build -d
```

Если nginx frontend занимает порт `80`, второй nginx на сервере не должен занимать тот же порт.

Для production лучше:

- один внешний reverse proxy на сервере
- backend и frontend compose без публикации лишних портов наружу
- наружу только `80` и `443`

## Для ИИ

### Контекст

Repo: NestJS monorepo with services:

- `main`: HTTP API + RabbitMQ consumer
- `files`: TCP microservice
- `payment`: TCP microservice + RabbitMQ producer
- root `docker-compose.yml`: backend services + local RabbitMQ

Current backend compose must stay separate from frontend compose.

Frontend must be independent:

```text
frontend/docker-compose.yml
frontend/Dockerfile
frontend/nginx.conf
frontend/package.json
```

Do not merge frontend services into backend compose unless user explicitly asks.

### Required architecture

Use two Docker Compose projects:

1. Backend compose from repo root.
2. Frontend compose from `frontend/`.

Both compose projects must share one Docker network:

```yaml
networks:
  mypixelgram-network:
    name: mypixelgram-network
    driver: bridge
```

In frontend compose:

```yaml
networks:
  mypixelgram-network:
    external: true
```

This allows frontend nginx to proxy to backend service DNS name:

```text
main:3000
```

### Backend compose requirements

Backend compose must expose or define:

- `main` service name must stay `main`
- `main` listens on `3000`
- backend network name must be stable: `mypixelgram-network`
- local RabbitMQ can stay in backend compose
- databases remain external if current env says so

If frontend nginx cannot resolve `main`, check:

```bash
docker network inspect mypixelgram-network
```

Both `main` and frontend `nginx` containers must be attached.

### Frontend implementation choice

Prefer Next.js React app:

```bash
npx create-next-app@latest frontend
```

Use:

- TypeScript
- App Router
- `src/`
- production Dockerfile
- nginx reverse proxy

Use `NEXT_PUBLIC_API_URL=/api`.

Browser code must call relative API paths:

```ts
fetch('/api/v1/...')
```

Do not hardcode `http://localhost:3000` in browser code.

### nginx routing

Frontend nginx routes:

```text
/              -> frontend:3000
/api/          -> main:3000/api/
/socket.io/    -> main:3000/socket.io/
```

Must include WebSocket headers for `/socket.io/`:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Must include upload size:

```nginx
client_max_body_size 50m;
```

### Server deployment plan

Human-safe deploy sequence:

```bash
cd /opt/mypixelgram/backend
docker compose up --build -d

docker network ls
docker network inspect mypixelgram-network

cd /opt/mypixelgram/frontend
docker compose up --build -d

docker ps
curl -I http://localhost
curl -I http://localhost/api/v1
```

If port conflict on `80`:

- stop old nginx, or
- map frontend nginx to another port, or
- use one host-level reverse proxy.

Production recommendation:

- expose only `80` and `443`
- do not expose internal service ports publicly
- move secrets out of git env files
- use `.env.production` or server secrets
- add TLS termination
- add restart policy `unless-stopped`

### Common failure cases

1. `host not found in upstream "main"`

Cause: frontend nginx not attached to backend network.

Fix:

```yaml
networks:
  mypixelgram-network:
    external: true
```

2. API 404 through nginx.

Cause: wrong `proxy_pass` slash behavior.

Use:

```nginx
location /api/ {
  proxy_pass http://main:3000/api/;
}
```

3. CORS or cookie issues.

Cause: frontend calls backend domain directly.

Fix: call relative `/api/...` through nginx.

4. WebSocket broken.

Cause: missing upgrade headers.

Fix: add `/socket.io/` nginx location.

5. OAuth callback wrong.

Cause: callback URL points to old domain/port.

Fix backend env:

```env
GITHUB_CALLBACK_URL=https://domain/api/v1/auth/github/callback
GOOGLE_CALLBACK_URL=https://domain/api/v1/auth/google/callback
```

### Implementation checklist

1. Create `frontend/` Next.js app.
2. Add frontend `Dockerfile`.
3. Add frontend `nginx.conf`.
4. Add frontend `docker-compose.yml`.
5. Ensure backend network has stable name `mypixelgram-network`.
6. Start backend compose.
7. Start frontend compose.
8. Test `/`, `/api/`, `/socket.io/`.
9. Move to server.
10. Add HTTPS.
