#!/usr/bin/env zx

import { copyFile, mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { $ } from 'zx';

// Stream child process output to the terminal (like running in bash).
$.stdio = 'inherit';

const homeDir = os.homedir();
const resolveHome = (p) => (p.startsWith('~/') ? path.join(homeDir, p.slice(2)) : p);

// 读取 .env 文件
const envContent = await readFile('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const localDataPath = envVars.LOCAL_DATA_PATH || '~/data/seaweedfs';
console.log(`Using LOCAL_DATA_PATH: ${localDataPath}`);

const dirList = [
  '~/data/mariadb',
  '~/data/redis',
  '~/data/caddy',
  '~/data/caddy/data',
  '~/data/caddy/config',
  '~/huang-ssh-private',
  `${localDataPath}/master`,
  `${localDataPath}/volume`,
  `${localDataPath}/filer`,
];

await Promise.all(
  dirList.map(async (dirPath) => {
    const resolved = resolveHome(dirPath);
    await mkdir(resolved, { recursive: true });
  })
);

const caddyfileSource = path.resolve('Caddyfile');
const caddyfileTarget = resolveHome('~/data/caddy/Caddyfile');
await copyFile(caddyfileSource, caddyfileTarget);

const sshKeySource = path.resolve('id_rsa');
const sshKeyTarget = resolveHome('~/huang-ssh-private/id_rsa');
await copyFile(sshKeySource, sshKeyTarget);

console.log('Pre-created directories and copied Caddyfile/id_rsa for docker-compose volumes.');

await $`docker compose up -d --build`;
