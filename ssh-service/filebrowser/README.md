# Filebrowser Docker Deployment

This project deploys a [Filebrowser](https://filebrowser.org/) instance using Docker Compose.

## Features
- **Root Directory**: Serves `/home/ubuntu/wwwroot`
- **Persistence**: Database and config stored in `./filebrowser.db` and `./config/settings.json`
- **Network**: Binds to `127.0.0.1:8080` for security (requires SSH tunnel or reverse proxy)
- **User Permissions**: Runs as non-root user (configurable UID/GID)

## Prerequisites
- Docker & Docker Compose installed
- Root/sudo access

## Installation

1. Navigate to the directory:
   ```bash
   cd /home/ubuntu/ssh-service/filebrowser
   ```

2. Run the installation script:
   ```bash
   # Default (UID:GID = 1001:1001)
   sudo bash install.sh

   # Custom UID/GID
   sudo bash install.sh [PUID] [PGID]
   # Example: sudo bash install.sh 1000 1000
   ```

   The script will:
   - Create the necessary data directory (`/home/ubuntu/wwwroot`)
   - Initialize an empty database if missing
   - Set up permissions
   - Start the Docker container

## Configuration

Configuration is located in `config/settings.json`.
You can modify this file to change port binding or other Filebrowser settings, then restart the container:
```bash
docker compose restart
```

## Troubleshooting

### "Error: open /database.db: is a directory"
If Docker incorrectly creates a directory for the database file:
1. Run `sudo bash install.sh` again. The script automatically detects and fixes this issue.

### Permission Denied
Ensure `install.sh` has execute permissions or run with `bash`:
```bash
sudo bash install.sh
```
