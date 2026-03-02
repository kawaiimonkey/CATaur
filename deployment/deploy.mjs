#!/usr/bin/env zx

// CATaur Deployment Script (zx version for Ubuntu 24.04)
// Stream child process output to the terminal (like running in bash).
$.stdio = 'inherit';
$.verbose = true;

// --- Configuration ---
const PROJECT_DIR = path.dirname(new URL(import.meta.url).pathname);
const VENV_PATH = path.join(PROJECT_DIR, '.venv');
const SERVICE_NAME = 'cataur-deployment';
const SERVICE_FILE = `/etc/systemd/system/${SERVICE_NAME}.service`;
const CURRENT_USER = (await $`whoami`).stdout.trim();

console.log('------------------------------------------');
console.log(`Deploying ${SERVICE_NAME} to systemd`);
console.log(`Project directory: ${PROJECT_DIR}`);
console.log(`Virtual Env: ${VENV_PATH}`);
console.log('------------------------------------------');

// 1. Pre-check: Ensure python3-venv is installed (Ubuntu 24 requirement)
const hasVenv = await $`dpkg -l | grep -q python3-venv`.exitCode === 0;
if (!hasVenv) {
  console.log('Installing missing python3-venv...');
  await $`sudo apt update`;
  await $`sudo apt install -y python3-venv`;
}

// 2. Uninstall old service
if (await fs.pathExists(SERVICE_FILE)) {
  console.log('Stopping and removing old service...');
  await $`sudo systemctl stop ${SERVICE_NAME}`.nothrow();
  await $`sudo systemctl disable ${SERVICE_NAME}`.nothrow();
  await $`sudo rm -f ${SERVICE_FILE}`;
}

// 3. Create/fix virtual environment
const pythonBin = path.join(VENV_PATH, 'bin', 'python');
if (!(await fs.pathExists(pythonBin))) {
  console.log(`Setting up a fresh virtual environment at ${VENV_PATH}...`);
  await $`rm -rf ${VENV_PATH}`;
  await $`python3 -m venv ${VENV_PATH}`;
}

// 4. Install dependencies
console.log('Installing/Updating dependencies...');
await $`${pythonBin} -m pip install --upgrade pip`;

const requirementsFile = path.join(PROJECT_DIR, 'requirements.txt');
if (await fs.pathExists(requirementsFile)) {
  await $`${pythonBin} -m pip install -r ${requirementsFile}`;
} else {
  console.log('Warning: requirements.txt not found, skipping dependency installation.');
}

// 5. Write Systemd configuration file
console.log('Configuring systemd service...');
const serviceContent = `[Unit]
Description=CATaur API Management Service
After=network.target

[Service]
User=${CURRENT_USER}
Group=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=${VENV_PATH}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=${VENV_PATH}/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
`;

await $`echo ${serviceContent} | sudo tee ${SERVICE_FILE} > /dev/null`;

// 6. Start service
console.log('Reloading systemd and starting service...');
await $`sudo systemctl daemon-reload`;
await $`sudo systemctl enable ${SERVICE_NAME}`;
await $`sudo systemctl restart ${SERVICE_NAME}`;

console.log('------------------------------------------');
console.log('Deployment successful!');
console.log(`Check status: systemctl status ${SERVICE_NAME}`);
console.log(`Check logs: journalctl -u ${SERVICE_NAME} -f`);
console.log('------------------------------------------');

await $`sudo systemctl status ${SERVICE_NAME} --no-pager`;
