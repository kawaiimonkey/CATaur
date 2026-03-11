#!/usr/bin/env zx

import { $, fs, cd, path, argv } from 'zx';

const numericArgs = argv._.map(String).filter((value) => /^\d+$/.test(value));
const PUID = numericArgs[0] || process.env.PUID || "1001";
const PGID = numericArgs[1] || process.env.PGID || "1001";

// Ensure script is run with sudo
if (process.getuid && process.getuid() !== 0) {
  console.error("Please run as root (use sudo)");
  process.exit(1);
}

console.log(`Starting Filebrowser installation with PUID=${PUID}, PGID=${PGID}...`);

// Change to the script directory
cd(path.dirname(new URL(import.meta.url).pathname));

// Create config directory
if (!await fs.pathExists("config")) {
  console.log("Creating config directory...");
  await $`mkdir -p config`;
}

// Create settings.json
console.log("Creating settings.json...");
const settingsJson = {
  port: 80,
  baseURL: "",
  address: "",
  log: "stdout",
  database: "/database.db",
  root: "/srv"
};

await fs.writeJson("config/settings.json", settingsJson, { spaces: 2 });

// Remove filebrowser.db if it is a directory (Docker residue)
if (await fs.pathExists("filebrowser.db")) {
  const stats = await fs.stat("filebrowser.db");
  if (stats.isDirectory()) {
    console.log("Removing invalid directory filebrowser.db...");
    await $`rm -rf filebrowser.db`;
  }
}

// Create empty database file if it doesn't exist
if (!await fs.pathExists("filebrowser.db")) {
  console.log("Creating empty database file...");
  await $`touch filebrowser.db`;
}

// Set permissions
await $`chown -R ${PUID}:${PGID} config`;
await $`chown ${PUID}:${PGID} filebrowser.db`;
await $`chmod 666 filebrowser.db`; // Relax permissions to ensure container access

// Verify permissions
console.log("File permissions:");
await $`ls -l filebrowser.db config/settings.json`;

// Create .env file for docker-compose
console.log("Creating .env file...");
await fs.writeFile(".env", `PUID=${PUID}\nPGID=${PGID}\n`);

// Check if docker is installed
try {
  await $`command -v docker`;
} catch (error) {
  console.error("Docker is not installed. Please install Docker first.");
  process.exit(1);
}

// Start the service
console.log("Starting Filebrowser service...");
await $`docker compose down`; // Ensure we recreate with new volumes
await $`docker compose up -d`;

console.log("Filebrowser deployment complete.");
console.log("Access it at http://127.0.0.1:28080");
