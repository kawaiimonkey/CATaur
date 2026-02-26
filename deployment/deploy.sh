#!/bin/bash

# CATaur Deployment Script
# This script sets up a Python virtual environment and installs CATaur as a systemd service.

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="cataur-deployment"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
CURRENT_USER=$(whoami)

echo "------------------------------------------"
echo "Deploying ${SERVICE_NAME} to systemd"
echo "Project directory: ${PROJECT_DIR}"
echo "Current user: ${CURRENT_USER}"
echo "------------------------------------------"

# Ensure we are on Linux
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "Error: This script is intended for Linux systems."
    exit 1
fi

# Uninstall old version if it exists
if [ -f "${SERVICE_FILE}" ]; then
    echo "Detected existing installation, uninstalling old version..."
    
    # Stop the service if it's running
    if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
        echo "Stopping ${SERVICE_NAME} service..."
        sudo systemctl stop "${SERVICE_NAME}"
    fi
    
    # Disable the service if it's enabled
    if sudo systemctl is-enabled --quiet "${SERVICE_NAME}" 2>/dev/null; then
        echo "Disabling ${SERVICE_NAME} service..."
        sudo systemctl disable "${SERVICE_NAME}"
    fi
    
    # Remove the service file
    echo "Removing old service file..."
    sudo rm -f "${SERVICE_FILE}"
    
    # Reload systemd
    echo "Reloading systemd daemon..."
    sudo systemctl daemon-reload
    
    echo "Old version uninstalled successfully."
    echo "------------------------------------------"
fi

# Create virtual environment if it doesn't exist or is broken
if [ ! -f "${PROJECT_DIR}/venv/bin/pip" ]; then
    echo "Creating virtual environment..."
    # Remove potentially broken venv directory
    if [ -d "${PROJECT_DIR}/venv" ]; then
        echo "Detected broken virtual environment (missing pip), cleaning up..."
        rm -rf "${PROJECT_DIR}/venv"
    fi
    # Check if python3-venv is installed (common issue on Ubuntu/Debian)
    if ! python3 -m venv --help > /dev/null 2>&1; then
        echo "Error: 'python3-venv' is not installed."
        echo "Please run: sudo apt update && sudo apt install -y python3-venv"
        exit 1
    fi
    python3 -m venv "${PROJECT_DIR}/venv"
fi

# Install/Update dependencies
echo "Installing dependencies..."
"${PROJECT_DIR}/venv/bin/python3" -m pip install --upgrade pip
"${PROJECT_DIR}/venv/bin/python3" -m pip install -r "${PROJECT_DIR}/requirements.txt"

# Create/Update systemd service file
echo "Configuring systemd service..."
sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=CATaur API Management Service
After=network.target

[Service]
User=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${PROJECT_DIR}/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=${PROJECT_DIR}/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and restart service
echo "Reloading systemd and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "------------------------------------------"
echo "Deployment successful!"
echo "You can check the status with: systemctl status ${SERVICE_NAME}"
echo "------------------------------------------"
sudo systemctl status "${SERVICE_NAME}" --no-pager
