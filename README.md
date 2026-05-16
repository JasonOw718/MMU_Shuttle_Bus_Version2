# MMU Shuttle Bus - Production Deployment Guide (Cloudflare Architecture)

This guide covers the deployment instructions for the MMU Shuttle Bus platform on an Ubuntu/Debian-based server, utilizing Cloudflare for DNS management and strict SSL/TLS encryption.

## 1. Cloudflare DNS Setup

Before touching the server, ensure your domain routing is configured in the Cloudflare Dashboard.

* Create an **A Record** pointing your desired API subdomain (e.g., `api`) to your server's public IPv4 address.
* Ensure the **Proxy status** (orange cloud) is turned on to hide your origin IP and enable Cloudflare's Edge Network protection.

## 2. Server Preparation & Repository Cloning

Update your server packages and install the required dependencies (Git and Docker).

```bash
sudo apt update
sudo apt install git docker.io docker-compose-v2 -y

```

Clone the application repository and navigate into the root directory:

```bash
git clone https://github.com/JasonOw718/MMU_Shuttle_Bus_Version2.git
cd MMU_Shuttle_Bus_Version2

```

## 3. Configure Cloudflare Origin Certificates

This infrastructure uses Cloudflare Origin Certificates to encrypt the connection between Cloudflare and your server. Create the specific directory mapped in your `docker-compose-prod.yml` and insert the certificate data generated from your Cloudflare dashboard.

```bash
sudo mkdir -p /etc/nginx/ssl

```

Create the certificate file and paste your PEM data:

```bash
sudo nano /etc/nginx/ssl/origin.pem

```

Create the private key file and paste your KEY data:

```bash
sudo nano /etc/nginx/ssl/origin.key

```

> **Note:** Ensure the file names (`origin.pem` and `origin.key`) match your Nginx volume mounts exactly to prevent Nginx from crashing with a `BIO routines::no such file` error.

## 4. Setting Up Environment Variables

Prepare the environment file at the root of the project.

Run the following command to generate the `.env` file:

```bash
touch .env
cat <<EOF > .env
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
PG_USERNAME=your_pg_username
PG_PASSWORD=your_pg_password
STORAGE_URL=/path/to/storage/
JWT_SECRET=your_super_secure_jwt_secret_here

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_ID=your_google_maps_id

VITE_API_URL=https://your-api-domain.com
VITE_WEB_SOCKET_URL=https://your-api-domain.com/ws-endpoint

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

```

> **Note on Storage:** Make sure the server grants the necessary read/write permissions to the `STORAGE_URL` path (`/opt/files/`) for image uploads.

## 5. Build and Spin Up the Server

Spin up the entire stack using Docker Compose. Nginx will automatically pick up the Cloudflare SSL certificates, and the Spring Boot backend will securely parse the CORS origins.

```bash
sudo docker compose -f docker-compose-prod.yml up -d --build

```

## 6. Database Seeding (Post-Deployment)

For the application functionality to work smoothly, the database must be seeded.

1. Access the pgAdmin console in your browser (routed securely via Nginx).
2. Log in using the credentials defined in your `.env` file (`admin@gmail.com`).
3. Connect to the Postgres database instance.
4. Run the `insert_value.sql` script to populate base records like routes, stations, and users.
