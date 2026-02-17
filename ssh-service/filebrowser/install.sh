#!/bin/bash

# Definition of directories
INSTALL_DIR="/home/ubuntu/ssh-service/filebrowser"
DATA_DIR="/home/ubuntu/wwwroot"
PUID=${1:-1001}
PGID=${2:-1001}

# Ensure script is run with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

echo "Starting Filebrowser installation with PUID=$PUID, PGID=$PGID..."

# Create data directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory: $DATA_DIR"
    mkdir -p "$DATA_DIR"
    chown "$PUID:$PGID" "$DATA_DIR"
fi

# Ensure we are in the install directory
cd "$(dirname "$0")" || exit

# Create config directory
if [ ! -d "config" ]; then
    echo "Creating config directory..."
    mkdir -p config
fi

# Create settings.json
echo "Creating settings.json..."
cat > config/settings.json <<EOF
{
  "port": 80,
  "baseURL": "",
  "address": "",
  "log": "stdout",
  "database": "/database.db",
  "root": "/srv"
}
EOF

# Remove filebrowser.db if it is a directory (Docker residue)
if [ -d "filebrowser.db" ]; then
    echo "Removing invalid directory filebrowser.db..."
    rm -rf filebrowser.db
fi

# Create empty database file if it doesn't exist
if [ ! -f "filebrowser.db" ]; then
    echo "Creating empty database file..."
    touch filebrowser.db
fi

# Set permissions
chown -R "$PUID:$PGID" config
chown "$PUID:$PGID" filebrowser.db

# Create .env file for docker-compose
echo "PUID=$PUID" > .env
echo "PGID=$PGID" >> .env

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Start the service
echo "Starting Filebrowser service..."
docker compose down # Ensure we recreate with new volumes
docker compose up -d

echo "Filebrowser deployment complete."
echo "Access it at http://127.0.0.1:8080"

