# Media Compression Service - Golang FFmpeg 处理服务

高性能媒体处理微服务，支持图片和视频压缩，使用 RabbitMQ 进行任务队列管理，SeaweedFS 进行分布式存储，支持 Docker 容器化部署。

## 特性

- ✅ **流式处理**: 通过 HTTP 流读取 SeaweedFS 文件，管道化给 FFmpeg，避免本地持久化
- ✅ **并发控制**: Worker Pool 模式，支持自定义并发数量限制
- ✅ **优雅关闭**: 支持 SIGTERM/SIGINT 信号，确保正在处理的任务完成后再关闭
- ✅ **手动 ACK**: RabbitMQ 消息手动确认，失败自动重队列
- ✅ **结构化日志**: 使用 zap 库提供高性能日志记录
- ✅ **完整容器化**: 提供 Dockerfile 和 docker-compose 配置

## 项目结构

```
compress-media/
├── main.go                  # 应用程序入口
├── go.mod                   # Go module 依赖
├── Dockerfile               # Docker 镜像构建配置
├── docker-compose.yml       # 容器编排配置
├── README.md               # 本文件
├── config/
│   └── config.go           # 配置管理
├── models/
│   └── task.go             # 数据模型定义
├── logger/
│   └── logger.go           # 日志初始化
├── messaging/
│   └── rabbitmq.go         # RabbitMQ 消费者实现
├── storage/
│   └── seaweedfs.go        # SeaweedFS 客户端实现
├── ffmpeg/
│   └── processor.go        # FFmpeg 处理器实现
└── workers/
    └── pool.go             # Worker Pool 并发管理
```

## 快速开始

### 前置要求

- Docker 和 Docker Compose
- 或本地：Go 1.25+, FFmpeg, RabbitMQ, SeaweedFS

### 使用 Docker Compose 启动（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务日志
docker-compose logs -f media-processor

# 停止所有服务
docker-compose down
```

访问 RabbitMQ 管理界面：http://localhost:15672 (用户名/密码: guest/guest)

### 本地开发运行

```bash
# 安装依赖
go mod download

# 启动 RabbitMQ（需要单独启动或使用 Docker）
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management-alpine

# 启动 SeaweedFS（需要单独启动或使用 Docker）
# 详见 docker-compose.yml 中的配置

# 设置环境变量
export RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
export SEAWEEDFS_URL="http://localhost:8888"
export MAX_WORKERS=4
export LOG_LEVEL=info

# 编译运行
go build -o media-processor
./media-processor
```

## 配置说明

通过环境变量配置服务，支持以下参数：

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672/` | RabbitMQ 连接 URL |
| `QUEUE_NAME` | `media-compress-tasks` | 任务队列名称 |
| `CONSUMER_COUNT` | `1` | 消费者数量 |
| `SEAWEEDFS_URL` | `http://seaweedfs:8888` | SeaweedFS Filer HTTP 地址 |
| `MAX_WORKERS` | `4` | 最大并发 Worker 数量 |
| `FFMPEG_PATH` | `ffmpeg` | FFmpeg 可执行文件路径 |
| `TASK_TIMEOUT_SEC` | `300` | 任务执行超时时间（秒） |
| `LOG_LEVEL` | `info` | 日志级别 (debug, info, warn, error) |

## API 和数据模型

### 任务消息格式 (Task)

从 RabbitMQ 队列接收的任务消息格式：

```json
{
  "task_id": "task-123",
  "input_path": "/input/task-123/video.mp4",
  "output_path": "/output/task-123/compressed.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 23,
    "preset": "medium",
    "resolution": "1280x720"
  }
}
```

### 支持的媒体类型和参数

#### 图片处理 (Image)

```json
{
  "task_id": "img-001",
  "input_path": "/input/img-001/photo.jpg",
  "output_path": "/output/img-001/photo_compressed.jpg",
  "media_type": "image",
  "format": "jpg",
  "compression_params": {
    "quality": 85
  }
}
```

**质量参数**: 
- `quality`: 1-100（推荐 80-95 保持质量）

#### 视频处理 (Video)

```json
{
  "task_id": "vid-001",
  "input_path": "/input/vid-001/movie.mp4",
  "output_path": "/output/vid-001/movie_compressed.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium",
    "resolution": "1920x1080"
  }
}
```

**视频参数**:
- `codec`: `libx264` (H.264) 或 `libx265` (H.265)
- `crf`: 0-51，默认 23（低值 = 高质量，文件更大）
- `preset`: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`
- `resolution`: 输出分辨率，例如 `1920x1080`, `1280x720`，留空保持原始分辨率

## 核心实现细节

### RabbitMQ 消费者 (messaging/rabbitmq.go)

- **连接管理**: 创建持久化队列，自动重连
- **手动 ACK**: 消息处理完成后手动确认，失败自动重队列
- **QoS 设置**: Prefetch 为 1，确保单次只处理一条消息

### SeaweedFS 流式 I/O (storage/seaweedfs.go)

- **GET 流**: 通过 HTTP GET 获取文件，返回 ReadCloser
- **PUT 流**: 通过 HTTP PUT 上传文件，支持流式上传
- **直接管道**: 避免中间缓存，降低内存占用

### FFmpeg 处理 (ffmpeg/processor.go)

- **流式管道**: 输入流 → FFmpeg 进程 → 输出流
- **超时控制**: 使用 context.WithTimeout 控制进程执行时间
- **错误处理**: 完整的错误捕获和日志记录

### Worker Pool (workers/pool.go)

- **固定大小**: 限制并发 FFmpeg 进程数，防止 CPU 爆满
- **任务队列**: 缓冲队列存储待处理任务
- **优雅关闭**: 
  1. 停止接收新任务
  2. 等待现有任务完成（有超时机制）
  3. 关闭资源

### 优雅关闭流程 (main.go)

```
收到 SIGTERM/SIGINT
    ↓
停止消费新消息 (cancel consumer context)
    ↓
停止接收新任务 (cancel pool context)
    ↓
等待所有 Worker 完成当前任务 (30秒超时)
    ↓
关闭 RabbitMQ 连接
    ↓
服务停止
```

## 性能调优建议

### CPU 使用率优化

1. **调整 MAX_WORKERS**: 根据 CPU 核心数调整
   ```bash
   # 4核服务器推荐值: 3-4
   # 8核服务器推荐值: 6-8
   export MAX_WORKERS=4
   ```

2. **FFmpeg Preset 选择**:
   - `fast/medium`: 更快完成，质量较好
   - `slow/veryslow`: 更高压缩率，耗时长

3. **CRF 值选择**:
   - 低值 (18-23): 高质量，文件大
   - 高值 (28-35): 低质量，文件小

### 内存优化

- 流式处理自动限制内存占用
- SeaweedFS 和 FFmpeg 都使用管道而非缓冲

### 吞吐量优化

1. 增加 Consumer 数量（如果 RabbitMQ 是瓶颈）
2. 使用更快的预设 (faster/fast)
3. 增加 SeaweedFS 副本数

## 监控和日志

### 日志输出示例

```
2025-02-18T10:30:45.123Z	info	Starting media compression service	{"rabbitmq_url": "amqp://guest:guest@rabbitmq:5672/", "seaweedfs_url": "http://seaweedfs:8888", "max_workers": 4}
2025-02-18T10:30:47.456Z	info	Received task	{"task_id": "task-001"}
2025-02-18T10:30:48.789Z	info	Task completed successfully	{"task_id": "task-001", "duration": "2.5s", "output_path": "/output/task-001/compressed.mp4"}
```

### 监控指标

可以通过日志查看：
- 活跃 Worker 数量
- 任务处理时间
- 错误率

未来可集成 Prometheus 导出指标。

## 错误处理与重试

### 自动重试场景

1. **消息反序列化失败**: 消息 Nack，重新入队
2. **SeaweedFS 连接失败**: 任务记录错误，下次重新处理（需要手动重新提交）
3. **FFmpeg 执行超时**: 超时错误，建议增加 TASK_TIMEOUT_SEC

### 手动处理失败任务

如需重新处理失败的任务，可以通过 RabbitMQ 管理界面或发送新消息的方式。

## 故障排查

### 服务启动失败

```bash
# 查看日志
docker-compose logs media-processor

# 常见原因：
# 1. RabbitMQ 未就绪 - 等待 30 秒后重试
# 2. SeaweedFS 未就绪 - 检查 Filer 健康状态
# 3. FFmpeg 不存在 - 容器内检查 ffmpeg 命令
```

### 任务卡住

```bash
# 查看活跃 Worker 数
docker-compose logs media-processor | grep "active"

# 查看任务日志
docker-compose logs media-processor | grep "task_id"

# 强制重启服务（丢弃当前任务）
docker-compose restart media-processor
```

### 内存不足

```bash
# 减少并发数
export MAX_WORKERS=2
docker-compose up -d --force-recreate
```

## 扩展建议

### 1. 添加任务结果回调

在 Worker 处理完成后，发送结果到回调 URL 或另一个队列。

### 2. 添加 Prometheus 指标

集成 prometheus/client_golang，导出处理时间、错误率等指标。

### 3. 实现死信队列 (DLQ)

处理失败的任务自动进入 DLQ，便于排查和重新处理。

### 4. 动态调整并发数

实现热更新机制，无需重启即可调整 MAX_WORKERS。

### 5. 添加 Web 管理界面

提供 HTTP API 查看服务状态、队列长度、Worker 健康状况。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2025-02-18

