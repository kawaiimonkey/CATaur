## Deployment steps

### 1. Prerequisites
- Docker & Docker Compose installed on Ubuntu 24.04.
- Domain name pointed to your server IP.

### 2. Environment Configuration
Update the `.env` file in the root directory:
```env
DB_PASSWORD=your_secure_db_password
REDIS_PASSWORD=your_secure_redis_password
JWT_SECRET=your_long_random_jwt_secret
```

### 3. Caddy Configuration
Move the [Caddyfile](Caddyfile) to `~/data/caddy/Caddyfile` on your server. Replace `api.40.233.103.9.sslip.io` with your actual domain and update the email for SSL notifications.

### 4. Deploy
Run the following command to build and start the containers in detached mode:
```bash
mkdir -p ~/data/caddy/config
mkdir -p ~/data/caddy/data
mkdir -p ~/data/mariadb
mkdir -p ~/data/redis
docker-compose up -d --build
```

### 5. Accessing Services
- **Web App/API**: `https://api.40.233.103.9.sslip.io`
- **Swagger Docs**: `https://api.40.233.103.9.sslip.io/api`
- **Database (MariaDB)**: Accessible via SSH Tunnel at `127.0.0.1:3306`.
- **Redis Cache**: Accessible via SSH Tunnel at `127.0.0.1:6379`.

### 6. Data Persistence
Data is persisted on the host machine at:
- `~/data/mariadb`
- `~/data/redis`
- `~/data/caddy`

### 7. Maintenance
- **Logs**: `docker compose logs -f`
- **Stop**: `docker compose down`
- **Restart**: `docker compose restart`
