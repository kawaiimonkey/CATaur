#!/bin/bash
set -e

# 从环境变量获取配置
USER_UID=${USER_UID:-1001}
USER_GID=${USER_GID:-1001}
USERNAME=${USERNAME:-uploaduser}

echo "==> 设置 SFTP 用户: $USERNAME (UID: $USER_UID, GID: $USER_GID)"

# 创建用户组（如果不存在）
if ! getent group $USERNAME > /dev/null 2>&1; then
    groupadd -g $USER_GID $USERNAME
    echo "    创建用户组: $USERNAME (GID: $USER_GID)"
fi

# 创建用户（如果不存在）
if ! id -u $USERNAME > /dev/null 2>&1; then
    useradd -m -u $USER_UID -g $USER_GID -s /bin/bash $USERNAME
    echo "    创建用户: $USERNAME (UID: $USER_UID)"
fi

# 设置用户家目录权限
# 注意：ChrootDirectory 要求目录必须由 root 拥有，权限为 755
echo "==> 设置目录权限"
chown root:root /home/$USERNAME
chmod 755 /home/$USERNAME

# 创建上传目录
mkdir -p /home/$USERNAME/upload
chown $USER_UID:$USER_GID /home/$USERNAME/upload
chmod 755 /home/$USERNAME/upload

# 设置 SSH 密钥目录
mkdir -p /home/$USERNAME/.ssh
chown $USER_UID:$USER_GID /home/$USERNAME/.ssh
chmod 700 /home/$USERNAME/.ssh

# 如果 authorized_keys 文件存在，设置权限
if [ -f /home/$USERNAME/.ssh/authorized_keys ]; then
    chown $USER_UID:$USER_GID /home/$USERNAME/.ssh/authorized_keys
    chmod 600 /home/$USERNAME/.ssh/authorized_keys
    echo "    已设置 authorized_keys 权限"
fi

echo "==> 启动 SSH 服务器"
echo "    监听端口: 22"
echo "    允许用户: $USERNAME"
echo "    上传目录: /home/$USERNAME/upload"

# 执行传入的命令（启动 sshd）
exec "$@"
