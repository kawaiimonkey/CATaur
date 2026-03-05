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

Email SMTP settings are no longer stored in `.env`; configure them through admin API and Redis:
- `GET /admin/email-config`
- `PUT /admin/email-config`

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


### 8. Logs
- **Loki**: `https://grafana.40.233.103.9.sslip.io/explore`
- **Grafana**: `https://grafana.40.233.103.9.sslip.io`
> 添加 Loki 数据源 (首次使用需要)
点击左侧侧边栏的 "Connections" -> "Data sources"。
点击 "Add data source"。
搜索并选择 "Loki"。
在 URL 栏输入：http://loki:3100（这是 Docker 内部网络地址）。
点击底部的 "Save & test"，确保显示 "Data source connected"
