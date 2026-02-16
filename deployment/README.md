# CATaur Deployment Manager

CATaur Deployment Manager 是一个基于 FastAPI 的轻量级 Web 工具，用于一键管理后端 API 的部署和日志查看。

## 主要功能

-   **一键重启/部署**: 通过 Web 界面触发后端 API 的重新部署（执行 Docker Compose 构建）。
-   **实时日志流**: 实时查看 Docker 容器的运行日志。
-   **跨平台运行**: 提供 Windows (`.ps1`) 和 Linux (`.sh`) 的启动脚本。
-   **Systemd 集成**: 提供 Linux 系统的系统级服务管理支持。

## 文件结构

-   `main.py`: FastAPI 应用主代码。
-   `static/`: 包含 Web 界面资源。
-   `deploy.sh`: Linux 一键部署脚本（配置 systemd）。
-   `cataur-deployment.service`: systemd 服务模板。
-   `run.sh`: Linux 手动启动脚本。
-   `run.ps1`: Windows 启动脚本。

## 准备工作 (Prerequisites)

### Linux (Ubuntu/Debian)
在运行部署脚本前，请确保安装了 Python 及其虚拟环境模块：
```bash
sudo apt update
sudo apt install -y python3 python3-venv
```

## 如何运行

### Linux 系统（一键部署为服务）

建议在生产环境中使用此方法，它会将应用配置为系统服务，开机自启。

1.  **赋予脚本执行权限**:
    ```bash
    chmod +x deploy.sh
    ```
2.  **执行部署脚本**:
    ```bash
    ./deploy.sh
    ```
    该脚本会自动完成：
    - 创建 Python 虚拟环境。
    - 安装所需依赖。
    - 生成并配置 `cataur-deployment.service` 服务。
    - 启动并启用服务（可以通过 `systemctl status cataur-deployment` 查看运行情况）。

### Windows 或开发环境手动运行

1.  确保已安装 Python 3.8+。
2.  运行启动脚本：
    - **Windows**: `.\run.ps1`
    - **Linux**: `./run.sh`
3.  访问地址: `http://localhost:8000`

## 日志查看

如果作为 systemd 服务运行，可以通过以下命令查看系统日志：
```bash
journalctl -u cataur-deployment -f
```
