# 快速参考卡片

## 🚀 快速命令

```bash
# Docker 操作
docker-compose up -d           # 启动所有服务
docker-compose down            # 停止所有服务
docker-compose logs -f service # 查看服务日志
docker-compose ps              # 查看容器状态

# 本地开发
go mod download                # 下载依赖
go build                       # 编译
go run main.go                # 直接运行
go test ./...                 # 运行测试
go vet ./...                  # 代码检查

# 使用 Makefile
make build                     # 编译
make run                       # 运行
make clean                     # 清理
make docker-build             # 构建 Docker 镜像
make docker-up                # 启动容器
make docker-down              # 停止容器
make docker-logs              # 查看日志
make publish-test             # 发送测试任务

# 测试任务发布
go run cmd/publish-task/main.go -type=video     # 视频任务
go run cmd/publish-task/main.go -type=image     # 图片任务
```

---

## 📋 环境变量速查表

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672/` | RabbitMQ 连接 |
| `QUEUE_NAME` | `media-compress-tasks` | 队列名称 |
| `SEAWEEDFS_URL` | `http://seaweedfs:8888` | SeaweedFS 地址 |
| `MAX_WORKERS` | `4` | 最大并发数 |
| `FFMPEG_PATH` | `ffmpeg` | FFmpeg 可执行文件 |
| `TASK_TIMEOUT_SEC` | `300` | 任务超时（秒） |
| `LOG_LEVEL` | `info` | 日志级别 |

---

## 🔗 Web 服务地址

| 服务 | 地址 | 用途 |
|------|------|------|
| RabbitMQ 管理 | http://localhost:15672 | 队列管理（guest/guest） |
| SeaweedFS Filer | http://localhost:8888 | 文件操作 |
| SeaweedFS Master | http://localhost:9333 | 集群管理 |

---

## 📝 消息格式速查

### 视频压缩任务

```json
{
  "task_id": "task-001",
  "input_path": "/input/task-001/video.mp4",
  "output_path": "/output/task-001/compressed.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium",
    "resolution": "1280x720"
  }
}
```

### 图片压缩任务

```json
{
  "task_id": "task-001",
  "input_path": "/input/task-001/photo.jpg",
  "output_path": "/output/task-001/photo-compressed.jpg",
  "media_type": "image",
  "format": "jpg",
  "compression_params": {
    "quality": 85
  }
}
```

---

## 🎯 常见配置组合

### 高质量输出（质量优先）
```
codec: libx264
crf: 18-23
preset: slow/veryslow
resolution: 1920x1080
quality: 90-95
```

### 平衡配置（推荐）
```
codec: libx264
crf: 23-28
preset: medium
resolution: 1280x720
quality: 85
```

### 快速输出（速度优先）
```
codec: libx264
crf: 32-35
preset: fast/faster
resolution: 960x540
quality: 75
```

---

## 🐛 故障排查速查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 任务未处理 | 服务未运行 | `docker-compose ps` 检查状态 |
| RabbitMQ 连接失败 | RabbitMQ 未启动 | 等待 30 秒或重启 RabbitMQ |
| SeaweedFS 404 | 文件不存在 | 确保文件上传到正确路径 |
| FFmpeg 超时 | 任务太复杂 | 增加 `TASK_TIMEOUT_SEC` |
| 内存溢出 | 并发太高 | 降低 `MAX_WORKERS` |
| 日志太多 | 日志级别太低 | 设置 `LOG_LEVEL=error` |

---

## 📊 性能参考

### 推荐配置

```
CPU 2核 → MAX_WORKERS=1
CPU 4核 → MAX_WORKERS=3
CPU 8核 → MAX_WORKERS=7
CPU 16核 → MAX_WORKERS=15
```

### 处理时间参考

```
视频 720p 60秒 @ H.264 medium
  → ~30-60 秒处理时间

图片 1920x1080 JPEG @ 85质量
  → ~2-5 秒处理时间

视频 1080p 60秒 @ H.265 slow
  → ~120-180 秒处理时间
```

---

## 🔄 完整工作流

```
1. 上传文件到 SeaweedFS
   curl -X PUT -F "file=@input.mp4" \
     http://localhost:8888/input/task-001/input.mp4

2. 发送任务到 RabbitMQ
   go run cmd/publish-task/main.go -type=video

3. 监控处理进度
   docker-compose logs -f media-processor

4. 下载处理结果
   curl -o output.mp4 \
     http://localhost:8888/output/task-001/compressed.mp4
```

---

## 📚 文档索引

- **README.md** - 完整项目文档
- **API.md** - API 参考和扩展指南
- **EXAMPLES.md** - 详细使用示例
- **PROJECT_SUMMARY.md** - 项目总结

---

## 🎯 关键文件

```
main.go                    # 应用入口和主循环
workers/pool.go            # 并发控制核心
messaging/rabbitmq.go      # 消息队列实现
storage/seaweedfs.go       # 文件存储实现
ffmpeg/processor.go        # 媒体处理实现
docker-compose.yml         # 完整部署配置
```

---

**最后更新**: 2025-02-18

