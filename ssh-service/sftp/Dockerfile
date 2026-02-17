FROM ubuntu:24.04

# 安装 OpenSSH Server
RUN apt-get update && \
    apt-get install -y openssh-server && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 创建必要的目录
RUN mkdir -p /run/sshd

# 创建用户和设置权限的脚本
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 生成 SSH 主机密钥
RUN ssh-keygen -A

# 暴露 SSH 端口
EXPOSE 22

# 设置入口点
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/sbin/sshd", "-D", "-e"]
