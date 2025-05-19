# event-reward-system
NestJS로 만든 이벤트/보상 관리 시스템
=======
# Event Reward System

이 프로젝트는 **이벤트/보상 관리 플랫폼**을 NestJS, MongoDB, MSA 구조로 구현한 예제입니다. 실제 서비스에서 사용할 수 있는 인증·인가, 이벤트 생성·조건 검증, 보상 정의·요청·이력 조회 등의 기능을 포함합니다.

---

## 🚀 아키텍처

3개의 마이크로서비스(MSA)와 MongoDB를 Docker Compose로 구성합니다:

- **Gateway Service** (`gateway-service/`)
  - 모든 외부 API 진입점
  - JWT 검증, 역할 기반 라우팅(Auth Guard, Roles Guard)
  - Auth Server & Event Server 프록시

- **Auth Service** (`auth-service/`)
  - 사용자 등록, 로그인, JWT 발급
  - 역할(role) 관리: `USER`, `OPERATOR`, `AUDITOR`, `ADMIN`

- **Event Service** (`event-service/`)
  - 이벤트 생성/조회 (조건: 로그인·초대)
  - 보상 정의/조회 (포인트, 아이템, 쿠폰)
  - 유저 보상 요청 (조건 검증, 중복 방지, 상태 기록)
  - 보상 요청 이력 조회 (USER 자신의 이력 / ADMIN·AUDITOR 전체 조회)

- **DB**: MongoDB 6 (볼륨: `mongo-data`)

---

## 📦 기술 스택

- **언어 & 런타임**: TypeScript, Node.js 18
- **프레임워크**: NestJS (Passport, Mongoose)
- **DB**: MongoDB
- **인증**: JWT (passport-jwt)
- **컨테이너**: Docker & Docker Compose

---

## 📂 프로젝트 구조

```
event-reward-system/
├─ docker-compose.yml
├─ .env
├─ gateway-service/
│  ├─ Dockerfile
│  ├─ src/
│  └─ package.json
├─ auth-service/
│  ├─ Dockerfile
│  ├─ src/
│  └─ package.json
└─ event-service/
   ├─ Dockerfile
   ├─ src/
   └─ package.json
```

---

## 📋 설정

1. 프로젝트 루트에 `.env` 파일 생성 (아래 예시 참고)
2. 서비스별 `.env` 확인:
   - `gateway-service/.env` (GATEWAY_PORT, JWT_SECRET, AUTH_SERVICE_URL, EVENT_SERVICE_URL)
   - `auth-service/.env` (MONGO_URI, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, AUTH_PORT)
   - `event-service/.env` (MONGO_URI, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, EVENT_PORT)

### .env (프로젝트 루트)

```dotenv
MONGO_URI=mongodb://mongo:27017
DB_NAME=eventdb
JWT_SECRET=verysecretkey
JWT_EXPIRES_IN=3600s
GATEWAY_PORT=3000
AUTH_PORT=3001
EVENT_PORT=3002
GATEWAY_URL=http://gateway:3000
AUTH_SERVICE_URL=http://auth:3001
EVENT_SERVICE_URL=http://event:3002
```

필요에 따라 `localhost`를 도커 네트워크 서비스 이름(`mongo`, `auth`, `event`)으로 변경할 수 있습니다.

---

## ⚙️ 실행

```bash
# 프로젝트 루트에서
docker-compose up -d --build
```

- **MongoDB**: `localhost:27017`
- **Gateway**:  `http://localhost:3000`
- **Auth Service**:  `http://localhost:3001`
- **Event Service**: `http://localhost:3002`

### 컨테이너 관리

```bash
docker-compose ps       # 상태 확인
docker-compose logs -f  # 로그 확인
docker-compose stop     # 중지
docker-compose down -v  # 중지 + 볼륨 제거
```

---

## 🔑 인증 & 권한

- **회원가입**:  `POST /auth/signup`
  ```json
  { "email": "user@example.com", "password": "pw1234", "roles": "USER" }
  ```
- **로그인**:    `POST /auth/login` → `{ access_token: "..." }`
- **JWT 토큰**: `Authorization: Bearer <token>` 헤더 필수

| 역할       | 권한                |
| -------- | ----------------- |
| USER     | 보상 요청, 내 요청 이력 조회 |
| OPERATOR | 이벤트 생성, 보상 정의     |
| AUDITOR  | 전체/특정 사용자 이력 조회   |
| ADMIN    | 모든 기능 접근          |

---

## 🔗 주요 API

### Gateway (모두 `http://localhost:3000`)

#### Auth

- `POST /auth/signup`  회원가입
- `POST /auth/login`   로그인 → JWT 발급

#### Events

- `POST /events`       이벤트 생성 (`OPERATOR`, `ADMIN`)
- `GET  /events`       전체 조회 (공개)
- `GET  /events/:id`    단일 조회

#### Rewards

- `POST /rewards`      보상 정의 (`OPERATOR`, `ADMIN`)
- `GET  /rewards`      전체/이벤트별 조회
- `GET  /rewards/:id`   단일 조회

#### Redemptions

- `POST /redemptions`  보상 요청 (`USER`)
- `GET  /redemptions`  이력 조회 (자신: `USER`, 전체: `ADMIN`/`AUDITOR`)
- `GET  /redemptions/:id` 단일 이력 조회 (소유자/관리자/감사자)

---

## 🛠️ 개발

```bash
# 각 서비스 디렉터리에서
npm install
npm run start:dev
```

---

## 📑 기타

- 유닛/통합 테스트는 선택사항이며, 추가 시 `test/` 디렉터리에 작성하세요.
- 조건 검증(`login`, `invite`) 로직은 **stub** 형태로 제공되며, 실제 서비스 연동 시 구현 필요합니다.
- README에 API 상세 예시 및 설계 의도를 추가로 작성해 두시면 가산점이 됩니다.

---

## 📑 회고
```
- auth/signup
- auth/login
auth 쪽 API가 gateway로 접근 시 제대로 작동하지 않아서
http://localhost:3001/auth/login 으로 접근 필요.

BadRequestException 등에서 리턴하는 에러메시지가
gateway로 접근 시 제대로 나오지 않아서 이 부분 개선 필요.

개발할때는 로컬에 서버3개 + 몽고디비1개를 각각 띄워서 하는게 개발하는데 더 용이했고
docker-compose를 사용시에는 한번에 구동시켜서 테스트 했습니다.

개발할때 docker-compose, 게이트웨이 프록시, jwt역할 검사 부분이 좀 까다로웠습니다.
```
