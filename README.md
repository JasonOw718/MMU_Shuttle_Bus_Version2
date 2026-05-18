# MMU Shuttle Bus

A full-stack shuttle bus tracking platform for Multimedia University comprising:

- **`shuttle-backend/`** &mdash; Spring Boot REST + WebSocket (STOMP) backend
- **`mmu_shuttle_student/`** &mdash; React + Vite student web app
- **`mmu_shuttle_admin/`** &mdash; React + Vite admin dashboard
- **`mmu_shuttle_driver/`** &mdash; Flutter mobile app for drivers
- **`nginx-local.conf` / `nginx-prod.conf`** &mdash; reverse proxy configs
- **`docker-compose-local.yml` / `docker-compose-prod.yml`** &mdash; orchestration

---

## Table of Contents

1. [Localhost Setup](#1-localhost-setup)
2. [Production Setup](#2-production-setup)
3. [Mobile Driver App Setup](#3-mobile-driver-app-setup)

---

## 1. Localhost Setup

This brings up Postgres + the Spring backend + an Nginx that serves the student web build on `http://localhost`.

### 1.1 Prerequisites

- **Docker** `>= 24.x` and **Docker Compose v2**
- **Node.js** `>= 20.x` (LTS) and **npm** `>= 10.x` &mdash; required to develop the web apps
- **Flutter** `>= 3.9.x` &mdash; only needed for the driver app (see [Section 3](#3-mobile-driver-app-setup))

### 1.2 Clone the Repository

```bash
git clone https://github.com/JasonOw718/MMU_Shuttle_Bus_Version2.git
cd MMU_Shuttle_Bus_Version2
```

### 1.3 Create the Root `.env`

Create a `.env` file at the repository root:

```env
# --- Postgres ---
DB_USERNAME=admin
DB_PASSWORD=admin

# --- pgAdmin ---
PG_USERNAME=admin@gmail.com
PG_PASSWORD=admin

# --- Backend ---
STORAGE_URL=/opt/files/
JWT_SECRET=your_super_secure_jwt_secret_here
SPRING_PROFILES_ACTIVE=local
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:5173,http://localhost:4173

# --- Student web build args (consumed at Vite build time) ---
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_ID=your_google_maps_id
VITE_API_URL=http://localhost/api
VITE_WEB_SOCKET_URL=http://localhost/ws-endpoint
```

> The `VITE_*` values are **build-time** inputs to the student Dockerfile (see `docker-compose-local.yml`). Changing them requires rebuilding the `nginx` service.

### 1.4 Start the Stack

```bash
docker compose -f docker-compose-local.yml up -d --build
```

This starts:

| Service           | Port    | Purpose                                |
| ----------------- | ------- | -------------------------------------- |
| `shuttle-backend` | 8080 (internal) | Spring Boot API + WebSocket     |
| `postgres-db`     | 5432 (internal) | PostgreSQL 15                   |
| `pgadmin`         | 5050    | pgAdmin web console                    |
| `nginx`           | 80, 443 | Serves student app + proxies `/api/`, `/ws-endpoint` |

Once up:

- Student app &rarr; <http://localhost>
- pgAdmin &rarr; <http://localhost:5050> (login with `PG_USERNAME` / `PG_PASSWORD`)

### 1.5 Run the Admin Dashboard

The admin dashboard is **not** baked into the Nginx image; run its Vite dev server separately.

```bash
cd mmu_shuttle_admin
npm install
npm run dev
```

Available at <http://localhost:5173>. See `mmu_shuttle_admin/README.md` for env-var details.

### 1.6 Run the Student App in Dev Mode (optional)

If you want HMR instead of the prebuilt Nginx version:

```bash
cd mmu_shuttle_student
npm install
npm run dev
```

### 1.7 Database Seeding

After the stack is up, seed the database via pgAdmin:

1. Open <http://localhost:5050> and log in.
2. Register a new server pointing to host `postgres-db`, port `5432`, database `shuttle_bus`, with the `DB_USERNAME` / `DB_PASSWORD` credentials.
3. Run your `insert_value.sql` seed script (routes, stations, users).

### 1.8 Tearing Down

```bash
docker compose -f docker-compose-local.yml down
# Add -v to wipe the Postgres volume:
docker compose -f docker-compose-local.yml down -v
```

---

## 2. Production Setup

In production this server **only hosts the backend stack** (Spring Boot + Postgres + pgAdmin) behind an Nginx reverse proxy. The Nginx instance here is dedicated to the backend &mdash; it does **not** serve any frontend assets. The student web app is deployed separately as a static site (e.g. on a CDN/static-hosting provider). The admin dashboard is **not deployed in production** by this setup.

`nginx-prod.conf` exposes only:

- `/api/` &rarr; Spring Boot REST API
- `/ws-endpoint` &rarr; STOMP WebSocket
- `/pgadmin/` &rarr; pgAdmin console

> **Note on commands:** The shell commands in this section use `apt` (Debian/Ubuntu). They are illustrative only &mdash; the stack is OS-agnostic. If you are deploying on RHEL/CentOS/Fedora/Amazon Linux, Alpine, Arch, macOS, etc., substitute the equivalent package-manager commands (`dnf`, `yum`, `apk`, `pacman`, `brew`, ...). The only hard requirements are `git`, `docker`, and the `docker compose` plugin.

### 2.1 Prerequisites

- A server with a public IPv4 address (any OS that can run Docker)
- A registered domain (e.g. `api.example.com`) with an **A record** pointing to the server's IP
- Ports `80` and `443` open in the firewall
- An SSL certificate and private key (see [Section 2.3](#23-install-ssl-certificates))

### 2.2 Install Dependencies & Clone

Example for Debian/Ubuntu &mdash; adjust for your OS:

```bash
sudo apt update
sudo apt install git docker.io docker-compose-v2 -y

git clone https://github.com/JasonOw718/MMU_Shuttle_Bus_Version2.git
cd MMU_Shuttle_Bus_Version2
```

### 2.3 Install SSL Certificates

`docker-compose-prod.yml` mounts the certificate and private key from:

- `/etc/nginx/ssl/origin.pem`
- `/etc/nginx/ssl/origin.key`

These can be sourced from any trusted certificate authority. Two common options:

**Option A: Let's Encrypt (free, auto-renewable)**

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d api.example.com
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/api.example.com/fullchain.pem /etc/nginx/ssl/origin.pem
sudo cp /etc/letsencrypt/live/api.example.com/privkey.pem   /etc/nginx/ssl/origin.key
```

**Option B: Self-signed (testing only)**

```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/origin.key \
  -out    /etc/nginx/ssl/origin.pem \
  -subj "/CN=api.example.com"
```

> **Important:** The filenames `origin.pem` and `origin.key` must match the volume mounts in `docker-compose-prod.yml` and the paths in `nginx-prod.conf`, otherwise Nginx will fail with `BIO routines::no such file`.

### 2.4 Create the Production `.env`

Create `.env` at the repository root with the following keys (no `VITE_*` &mdash; the student web app is built and deployed separately on a static host):

```env
# --- Postgres ---
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# --- pgAdmin ---
PG_USERNAME=your_pgadmin_login_email
PG_PASSWORD=your_pgadmin_password

# --- Backend ---
STORAGE_URL=/opt/files/
JWT_SECRET=your_super_secure_jwt_secret_here
CORS_ALLOWED_ORIGINS=https://your-student-app.example.com
SPRING_PROFILES_ACTIVE=prod

# --- Loki (centralised logging) ---
LOKI_URL=https://your-loki-instance/loki/api/v1/push
LOKI_USER=your_loki_user_id
LOKI_PASSWORD=your_loki_api_token
```

| Key                      | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `DB_USERNAME` / `DB_PASSWORD`     | Postgres superuser credentials                                  |
| `PG_USERNAME` / `PG_PASSWORD`     | pgAdmin login (`PG_USERNAME` must be an email)                  |
| `STORAGE_URL`            | Host-side path the backend uses for uploaded files (e.g. `/opt/files/`) |
| `JWT_SECRET`             | Signing secret for issued JWTs                                          |
| `CORS_ALLOWED_ORIGINS`   | Comma-separated list of allowed origins (your deployed student web app domain)              |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`prod`)                                          |
| `LOKI_URL`               | Loki push endpoint for log shipping                                     |
| `LOKI_USER` / `LOKI_PASSWORD` | Loki Basic-Auth credentials                                        |

> **Storage path:** Ensure the directory in `STORAGE_URL` exists on the host and is read/write accessible by the backend container.

### 2.5 Student Web App Deployment (out of scope for this server)

The `mmu_shuttle_student/` app is built locally or in CI and deployed as a static site on your preferred static-hosting platform. Configure its `VITE_API_URL` and `VITE_WEB_SOCKET_URL` at build time to point at this server (e.g. `https://api.example.com` and `https://api.example.com/ws-endpoint`). Its build-time env vars should be managed in that platform's project settings &mdash; **not** in this server's `.env`.

> The admin dashboard (`mmu_shuttle_admin/`) is intentionally **not** deployed in production by this setup.

### 2.6 Spin Up the Stack

```bash
sudo docker compose -f docker-compose-prod.yml up -d --build
```

Verify everything is running:

```bash
sudo docker compose -f docker-compose-prod.yml ps
sudo docker compose -f docker-compose-prod.yml logs -f shuttle-backend
```

### 2.7 Database Seeding

Same as [Section 1.7](#17-database-seeding), but access pgAdmin through your production domain (e.g. `https://api.example.com/pgadmin/`).

### 2.8 Certificate Renewal

If using Let's Encrypt, automate renewal:

```bash
sudo crontab -e
# Add:
0 3 * * * certbot renew --quiet && \
  cp /etc/letsencrypt/live/api.example.com/fullchain.pem /etc/nginx/ssl/origin.pem && \
  cp /etc/letsencrypt/live/api.example.com/privkey.pem   /etc/nginx/ssl/origin.key && \
  docker compose -f /path/to/repo/docker-compose-prod.yml exec nginx nginx -s reload
```

---

## 3. Mobile Driver App Setup

The driver mobile app (`mmu_shuttle_driver/`) is a Flutter project that talks to the same backend via REST + STOMP WebSocket.

### 3.1 Prerequisites

- **Flutter SDK** `>= 3.9.x` &mdash; follow the [official install guide](https://docs.flutter.dev/get-started/install)
- **Android Studio** with an Android emulator, or a physical Android device with USB debugging
- **Xcode** (macOS only) if targeting iOS
- A reachable backend (local or production)

Verify your toolchain:

```bash
flutter doctor
```

### 3.2 Install Project Dependencies

```bash
cd mmu_shuttle_driver
flutter pub get
```

### 3.3 Configure `.env`

Create `mmu_shuttle_driver/.env`:

```env
API_URL=http://10.0.2.2:80/api
WEB_SOCKET_URL=http://10.0.2.2:80/ws-endpoint
```

> **Emulator networking:**
> - Android emulator: `10.0.2.2` resolves to the host machine's `localhost`.
> - iOS simulator: use `http://localhost:80/...` directly.
> - Physical device: use your machine's LAN IP (e.g. `http://192.168.x.x:80/...`) and ensure the device is on the same network.

For production, point at the deployed API:

```env
API_URL=https://api.example.com/api
WEB_SOCKET_URL=https://api.example.com/ws-endpoint
```

### 3.4 Run the App

List available devices and launch:

```bash
flutter devices
flutter run
```

To target a specific device:

```bash
flutter run -d <device-id>
```

### 3.5 Build Release Artifacts

**Android APK / App Bundle:**

```bash
flutter build apk --release
# or
flutter build appbundle --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

**iOS (macOS only):**

```bash
flutter build ios --release
```

Then archive and distribute via Xcode.

### 3.6 Required Permissions

The driver app uses background location, notifications, and battery info. On Android, the relevant permissions are declared in `android/app/src/main/AndroidManifest.xml`. On iOS, ensure `Info.plist` includes the location, notification, and "always allow" location strings before submitting to the App Store.

