# CATaur Deployment Manager

CATaur Deployment Manager is a lightweight FastAPI-based web tool for one-click management of backend API deployment and log monitoring.

## Key Features

-   **One-click Restart/Deployment**: Trigger backend API redeployment via the web interface (executes Docker Compose build).
-   **Real-time Log Streaming**: View Docker container runtime logs in real-time.
-   **Cross-platform Support**: Provides startup scripts for both Windows (`.ps1`) and Linux (`.sh`).
-   **Systemd Integration**: Provides system-level service management support for Linux systems.

## File Structure

-   `main.py`: Main FastAPI application code.
-   `static/`: Contains web interface resources.
-   `deploy.sh`: Linux one-click deployment script (configures systemd).
-   `cataur-deployment.service`: systemd service template.
-   `run.sh`: Linux manual startup script.
-   `run.ps1`: Windows startup script.

## Prerequisites

### Linux (Ubuntu/Debian)
Before running the deployment script, ensure Python and its virtual environment module are installed:
```bash
sudo apt update
sudo apt install -y python3 python3-venv
```

## How to Run

### Linux System (One-click deploy as a service)

This is the recommended method for production environments. It configures the application as a system service that starts automatically on boot.

1.  **Grant execution permissions to the script**:
    ```bash
    chmod +x deploy.sh
    ```
2.  **Execute the deployment script**:
    ```bash
    ./deploy.sh
    ```
    The script automatically performs the following:
    - Creates a Python virtual environment.
    - Installs required dependencies.
    - Generates and configures the `cataur-deployment.service`.
    - Starts and enables the service (you can check the status via `systemctl status cataur-deployment`).

### Manual Run on Windows or Development Environment

1.  Ensure Python 3.8+ is installed.
2.  Run the startup script:
    - **Windows**: `.\run.ps1`
    - **Linux**: `./run.sh`
3.  Access URL: `http://localhost:8000`

## Log Viewing

If running as a systemd service, you can view system logs with the following command:
```bash
journalctl -u cataur-deployment -f
```
