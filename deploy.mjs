#!/usr/bin/env zx

import { copyFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { $ } from 'zx';

const homeDir = os.homedir();
const resolveHome = (p) => (p.startsWith('~/') ? path.join(homeDir, p.slice(2)) : p);

const dirList = [
  '~/data/mariadb',
  '~/data/redis',
  '~/data/caddy',
  '~/data/caddy/data',
  '~/data/caddy/config',
  '~/huang-ssh-private',
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

$.verbose = false;
console.log('Pre-created directories and copied Caddyfile/id_rsa for docker-compose volumes.');

await $`docker compose up -d --build`;
