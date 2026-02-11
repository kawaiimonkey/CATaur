## Make directory
```bash
# For seaweedfs, the path must be match with .env.prod (LOCAL_DATA_PATH)
mkdir -p ~/data/seaweedfs

# For caddy
mkdir -p ~/data/caddy/data
mkdir -p ~/data/caddy/config
```
## Environment variables
```bash
cp .env.prod .env
```
## Caddyfile:
```
file-service.151.145.35.129.sslip.io {
    reverse_proxy app:3000

    tls {
        issuer acme {
            dir https://acme.zerossl.com/v2/DV90
            email big.test.free@gmail.com
        }
    }
}
```

## Upload files to server
> upload files to server except dist folder, node_modules folder, .git folder

## Run
```bash
docker compose up -d --build
```

## Maintenance
```bash
# Remove all containers
docker compose down

# Update files
# Upload files to server except dist folder, node_modules folder, .git folder
# Run
docker compose up -d --build
```

## SSH Tunneling
```bash
# Multiple ports
ssh -L 9333:localhost:9333 -L 8888:localhost:8888 -L 18080:localhost:18080 root@151.145.35.129
```

## SeaweedFS health check url
> https://file-service.151.145.35.129.sslip.io/health
