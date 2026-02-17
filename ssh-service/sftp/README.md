# SFTP 服务器 - Docker Compose 配置

这是一个基于 Docker Compose v2 的 SFTP 专用服务器，适用于 Ubuntu 24.04 with Rootless Docker。

## 功能特性

- ✅ 仅支持 SFTP 访问，禁止所有其他 SSH 功能
- ✅ 使用 SSH 公钥认证
- ✅ 文件上传到宿主机目录：`/home/ubuntu/wwwroot`
- ✅ 匹配宿主机 UID/GID：1001
- ✅ 适配 Rootless Docker 环境
- ✅ 安全配置：禁止 Shell、端口转发、X11 转发等

## 文件说明

```
sftp/
├── docker-compose.yml    # Docker Compose 配置文件
├── Dockerfile            # Docker 镜像构建文件
├── entrypoint.sh         # 容器启动脚本
├── sshd_config           # SSH 服务器配置（只允许 SFTP）
├── uploaduser.pub        # 用户公钥文件
└── README.md             # 本文档
```

## 安全限制

该配置严格限制了用户权限，只允许 SFTP 操作：

- ❌ 禁止 Shell 访问
- ❌ 禁止 SSH 命令执行
- ❌ 禁止端口转发（TCP/X11/Agent）
- ❌ 禁止隧道
- ❌ 禁止 TTY 分配
- ✅ 仅允许文件传输（SFTP）

## 使用方法

### 1. 前置要求

- Ubuntu 24.04
- Rootless Docker 已安装并配置
- Docker Compose V2
- 确保宿主机目录存在：`/home/ubuntu/wwwroot`

### 2. 创建上传目录

```bash
# 创建上传目录（如果不存在）
mkdir -p /home/ubuntu/wwwroot
chmod 755 /home/ubuntu/wwwroot
```

### 3. 启动服务

```bash
# 进入 sftp 目录
cd sftp/

# 构建并启动容器
docker compose up -d

# 查看日志
docker compose logs -f
```

### 4. 停止服务

```bash
docker compose down
```

### 5. 重启服务

```bash
docker compose restart
```

## 客户端连接

### SFTP 命令行

```bash
# 使用 SFTP 连接（替换 SERVER_IP 为实际服务器 IP）
sftp -P 2222 -i /path/to/private_key uploaduser@SERVER_IP

# 连接后可以使用的命令
sftp> cd upload          # 进入上传目录
sftp> put localfile.txt  # 上传文件
sftp> get remotefile.txt # 下载文件
sftp> ls                 # 列出文件
sftp> exit               # 退出
```

### 使用 FileZilla 等 GUI 工具

- **协议**：SFTP
- **主机**：服务器 IP 地址
- **端口**：2222
- **用户名**：uploaduser
- **密钥文件**：对应 `uploaduser.pub` 的私钥

## 目录映射

- **容器内路径**：`/home/uploaduser/upload`
- **宿主机路径**：`/home/ubuntu/wwwroot`
- **用户访问**：登录后直接在 `upload` 目录下操作

## 安全测试

### ✅ 测试 SFTP 上传（应该成功）

```bash
echo "test" > test.txt
sftp -P 2222 -i /path/to/private_key uploaduser@SERVER_IP <<EOF
cd upload
put test.txt
ls
exit
EOF
```

### ❌ 测试 SSH 命令执行（应该失败）

```bash
# 尝试执行命令 - 应该被拒绝
ssh -p 2222 -i /path/to/private_key uploaduser@SERVER_IP "ls -la"
# 预期输出：This service allows sftp connections only.
```

### ❌ 测试 SSH 登录（应该失败）

```bash
# 尝试登录 Shell - 应该被拒绝
ssh -p 2222 -i /path/to/private_key uploaduser@SERVER_IP
# 预期：无法获取 Shell 访问
```

### ❌ 测试端口转发（应该失败）

```bash
# 尝试端口转发 - 应该被拒绝
ssh -p 2222 -L 8080:localhost:80 -i /path/to/private_key uploaduser@SERVER_IP
# 预期：端口转发被拒绝
```

## 故障排查

### 查看容器日志

```bash
docker compose logs -f sftp-server
```

### 查看容器状态

```bash
docker compose ps
```

### 进入容器调试

```bash
docker compose exec sftp-server bash
```

### 检查权限

```bash
# 在容器内检查
ls -la /home/uploaduser/
ls -la /home/uploaduser/.ssh/
ls -la /home/uploaduser/upload/
```

### 常见问题

1. **连接被拒绝**
   - 检查防火墙是否开放 2222 端口
   - 确认容器正在运行：`docker compose ps`

2. **权限被拒绝**
   - 检查公钥是否正确配置在 `uploaduser.pub`
   - 确认私钥文件权限：`chmod 600 /path/to/private_key`
   - 检查宿主机目录权限：`ls -la /home/ubuntu/wwwroot`

3. **无法上传文件**
   - 确认 `/home/ubuntu/wwwroot` 目录存在且有写权限
   - 检查容器内的目录映射是否正确

## 配置修改

### 更改端口

编辑 `docker-compose.yml`：

```yaml
ports:
  - "新端口:22"  # 例如 "2223:22"
```

### 更改上传目录

编辑 `docker-compose.yml`：

```yaml
volumes:
  - /新的/宿主机/路径:/home/uploaduser/upload
```

### 更改 UID/GID

编辑 `docker-compose.yml`：

```yaml
environment:
  - USER_UID=新的UID
  - USER_GID=新的GID
```

## 维护

### 更新镜像

```bash
# 重新构建镜像
docker compose build --no-cache

# 重启服务
docker compose up -d
```

### 备份配置

```bash
# 备份整个目录
tar -czf sftp-config-backup.tar.gz sftp/
```

## 公钥信息

- **类型**：ED25519
- **指纹**：需要使用 `ssh-keygen -lf uploaduser.pub` 查看
- **用户**：uploaduser@server

## 许可和支持

该配置适用于 Ubuntu 24.04 和 Rootless Docker 环境。
