#!/bin/bash
# SFTP 服务器快速部署脚本

set -e

echo "================================================"
echo "  SFTP-Only 服务器部署脚本"
echo "================================================"
echo ""

# 检查是否在 rootless Docker 环境
if [ -z "$XDG_RUNTIME_DIR" ]; then
    echo "⚠️  警告：未检测到 Rootless Docker 环境变量"
    echo "   如果您使用的是 Rootless Docker，请确保："
    echo "   1. 已正确设置环境变量"
    echo "   2. Docker daemon 在用户空间运行"
    echo ""
fi

# 检查 Docker Compose
echo "🔍 检查 Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：未找到 Docker"
    echo "   请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ 错误：未找到 Docker Compose V2"
    echo "   请先安装或升级 Docker Compose"
    exit 1
fi

echo "✅ Docker environment OK"
echo ""

# 检查并创建上传目录
UPLOAD_DIR="/home/ubuntu/wwwroot"
echo "🔍 检查上传目录..."
if [ ! -d "$UPLOAD_DIR" ]; then
    echo "📁 创建上传目录: $UPLOAD_DIR"
    mkdir -p "$UPLOAD_DIR"
    chmod 755 "$UPLOAD_DIR"
    echo "✅ 上传目录已创建"
else
    echo "✅ 上传目录已存在: $UPLOAD_DIR"
fi
echo ""

# 检查公钥文件
echo "🔍 检查公钥文件..."
if [ ! -f "uploaduser.pub" ]; then
    echo "❌ 错误：未找到公钥文件 uploaduser.pub"
    exit 1
fi
echo "✅ 公钥文件存在"
echo ""

# 停止旧容器（如果存在）
echo "🛑 停止现有容器..."
docker compose down 2>/dev/null || true
echo ""

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker compose build
echo ""

# 启动服务
echo "🚀 启动 SFTP 服务..."
docker compose up -d
echo ""

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查服务状态
echo "📊 服务状态："
docker compose ps
echo ""

# 显示日志
echo "📝 最近日志："
docker compose logs --tail=20
echo ""

# 显示连接信息
echo "================================================"
echo "  ✅ 部署完成！"
echo "================================================"
echo ""
echo "📌 连接信息："
echo "   端口：2222"
echo "   用户：uploaduser"
echo "   认证：SSH 公钥"
echo "   上传目录：/home/ubuntu/wwwroot"
echo ""
echo "📝 使用示例："
echo "   sftp -P 2222 -i /path/to/private_key uploaduser@localhost"
echo ""
echo "🔍 查看日志："
echo "   docker compose logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker compose down"
echo ""
