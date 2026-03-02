#!/bin/bash

# CATaur Deployment Script (Fixed for Ubuntu 24.04)
set -e

# --- Configuration ---
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 统一使用 .venv (带点，符合 Linux 隐藏目录习惯)
VENV_PATH="${PROJECT_DIR}/.venv"
SERVICE_NAME="cataur-deployment"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
CURRENT_USER=$(whoami)

echo "------------------------------------------"
echo "Deploying ${SERVICE_NAME} to systemd"
echo "Project directory: ${PROJECT_DIR}"
echo "Virtual Env: ${VENV_PATH}"
echo "------------------------------------------"

# 1. 预检查：确保安装了 python3-venv (Ubuntu 24 必需)
if ! dpkg -l | grep -q python3-venv; then
    echo "Installing missing python3-venv..."
    sudo apt update && sudo apt install -y python3-venv
fi

# 2. 卸载旧服务 (逻辑保持不变)
if [ -f "${SERVICE_FILE}" ]; then
    echo "Stopping and removing old service..."
    sudo systemctl stop "${SERVICE_NAME}" || true
    sudo systemctl disable "${SERVICE_NAME}" || true
    sudo rm -f "${SERVICE_FILE}"
fi

# 3. 创建/修复虚拟环境
# 如果目录不存在，或者虽然有目录但里面没 python，就重建
if [ ! -f "${VENV_PATH}/bin/python" ]; then
    echo "Setting up a fresh virtual environment at ${VENV_PATH}..."
    rm -rf "${VENV_PATH}"
    python3 -m venv "${VENV_PATH}"
fi

# 4. 安装依赖
echo "Installing/Updating dependencies..."
"${VENV_PATH}/bin/python" -m pip install --upgrade pip
if [ -f "${PROJECT_DIR}/requirements.txt" ]; then
    "${VENV_PATH}/bin/python" -m pip install -r "${PROJECT_DIR}/requirements.txt"
else
    echo "Warning: requirements.txt not found, skipping dependency installation."
fi

# 5. 写入 Systemd 配置文件
echo "Configuring systemd service..."
sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=CATaur API Management Service
After=network.target

[Service]
User=${CURRENT_USER}
Group=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}
# 关键修复：确保 PATH 指向正确的 .venv 且 ExecStart 路径无误
Environment="PATH=${VENV_PATH}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=${VENV_PATH}/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 6. 启动服务
echo "Reloading systemd and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "------------------------------------------"
echo "Deployment successful!"
echo "Check status: systemctl status ${SERVICE_NAME}"
echo "Check logs: journalctl -u ${SERVICE_NAME} -f"
echo "------------------------------------------"
sudo systemctl status "${SERVICE_NAME}" --no-pager