# 使用示例与测试场景

本文档提供了完整的使用示例和测试场景，帮助你快速上手媒体处理服务。

## 快速开始示例

### 1. 启动完整的 Docker 环境

```bash
docker-compose up -d
```

这将启动：
- RabbitMQ (端口 5672, 管理界面 15672)
- SeaweedFS Master (端口 9333)
- SeaweedFS Volume Server (端口 8080)
- SeaweedFS Filer (端口 8888)
- Media Processor Service

### 2. 上传测试文件到 SeaweedFS

```bash
# 创建测试目录和文件
mkdir -p test_files
echo "test content" > test_files/test.txt

# 上传文件到 SeaweedFS
curl -X PUT \
  -F "file=@test_files/test.txt" \
  http://localhost:8888/input/task-001/test.txt
```

### 3. 发送压缩任务到 RabbitMQ

#### 方式 A：使用提供的发布工具

```bash
# 发送视频压缩任务
go run cmd/publish-task/main.go -type=video

# 发送图片压缩任务
go run cmd/publish-task/main.go -type=image
```

#### 方式 B：使用 curl 发送原始 JSON（需要 RabbitMQ HTTP API）

```bash
# 先启用 RabbitMQ HTTP API 插件
curl -i -u guest:guest http://localhost:15672/api/exchanges/%2f

# 发送消息
curl -i -u guest:guest -H "content-type:application/json" \
  -XPOST http://localhost:15672/api/exchanges/%2f/amq.default/publish \
  -d'{
    "properties":{},
    "routing_key":"media-compress-tasks",
    "payload":"eyJ0YXNrX2lkIjoidGVzdC12aWRlby0wMDEiLCJpbnB1dF9wYXRoIjoiL2lucHV0L3Rlc3QtdmlkZW8vc2FtcGxlLm1wNCIsIm91dHB1dF9wYXRoIjoiL291dHB1dC90ZXN0LXZpZGVvL3NhbXBsZS1jb21wcmVzc2VkLm1wNCIsIm1lZGlhX3R5cGUiOiJ2aWRlbyIsImZvcm1hdCI6Im1wNCIsImNvbXByZXNzaW9uX3BhcmFtcyI6eyJjb2RlYyI6ImxpYng4Y2FyZSIsImNyZiI6MjgsInByZXNldCI6Im1lZGl1bSIsInJlc29sdXRpb24iOiIxMjgweDcyMCJ9fQ==",
    "payload_encoding":"base64"
  }'
```

### 4. 监控任务处理

```bash
# 查看服务日志
docker-compose logs -f media-processor

# 查看 RabbitMQ 队列状态
# 访问 http://localhost:15672
# 用户名: guest, 密码: guest
```

### 5. 检索处理结果

```bash
# 下载处理后的文件
curl -O -J http://localhost:8888/output/test-video/sample-compressed.mp4
```

---

## 完整测试场景

### 场景 1: 视频压缩处理流程

**需求**: 将 1080p 视频压缩为 720p，使用 H.264 编码，CRF=28

**步骤**:

1. **准备测试视频**
```bash
# 使用 FFmpeg 创建一个测试视频（10秒，1080p）
ffmpeg -f lavfi -i testsrc=s=1920x1080:d=10 \
       -f lavfi -i sine=f=1000:d=10 \
       -pix_fmt yuv420p \
       -c:v libx264 -preset medium \
       -c:a aac \
       test_files/input_1080p.mp4

# 上传到 SeaweedFS
curl -X PUT \
  -F "file=@test_files/input_1080p.mp4" \
  http://localhost:8888/input/scenario-1/video.mp4
```

2. **发送任务消息**
```bash
cat > task_video.json << 'EOF'
{
  "task_id": "scenario-1-video",
  "input_path": "/input/scenario-1/video.mp4",
  "output_path": "/output/scenario-1/video-720p.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium",
    "resolution": "1280x720"
  }
}
EOF

# 发布任务
go run cmd/publish-task/main.go < task_video.json
```

3. **监控进度**
```bash
# 查看日志
docker-compose logs -f media-processor | grep "scenario-1"

# 预期输出：
# 2025-02-18T10:30:48.123Z  info  Processing task     {"task_id": "scenario-1-video", ...}
# 2025-02-18T10:30:55.456Z  info  Task completed successfully  {"duration": "7.3s", ...}
```

4. **验证结果**
```bash
# 检查输出文件大小
curl -I http://localhost:8888/output/scenario-1/video-720p.mp4

# 下载并验证
curl -o result.mp4 http://localhost:8888/output/scenario-1/video-720p.mp4
ffprobe result.mp4
```

---

### 场景 2: 批量图片压缩

**需求**: 一次性压缩 10 张图片，每张质量 85

**步骤**:

1. **准备测试图片**
```bash
# 创建 10 张测试图片
for i in {1..10}; do
  ffmpeg -f lavfi -i color=c=blue:s=1920x1080:d=1 \
         -frames:v 1 \
         test_files/image_$i.jpg
done
```

2. **批量上传到 SeaweedFS**
```bash
for i in {1..10}; do
  curl -X PUT \
    -F "file=@test_files/image_$i.jpg" \
    http://localhost:8888/input/batch-images/image_$i.jpg
done
```

3. **批量发送任务**
```bash
cat > publish_batch.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
  cat << JSON | go run cmd/publish-task/main.go
{
  "task_id": "batch-image-$i",
  "input_path": "/input/batch-images/image_$i.jpg",
  "output_path": "/output/batch-images/image_$i-compressed.jpg",
  "media_type": "image",
  "format": "jpg",
  "compression_params": {
    "quality": 85
  }
}
JSON
  sleep 1
done
EOF

chmod +x publish_batch.sh
./publish_batch.sh
```

4. **监控批处理**
```bash
# 实时查看处理进度
docker-compose logs -f media-processor | grep "batch-image"

# 查看完成的任务数
docker-compose logs media-processor | grep "Task completed" | wc -l
```

---

### 场景 3: 并发压力测试

**需求**: 测试最大并发处理能力（MAX_WORKERS=4）

**步骤**:

1. **修改 docker-compose.yml**
```yaml
environment:
  MAX_WORKERS: 4
  LOG_LEVEL: "info"
```

2. **生成 100 个并发任务**
```bash
cat > stress_test.sh << 'EOF'
#!/bin/bash
for i in {1..100}; do
  taskid="stress-test-$i"
  cat << JSON | go run cmd/publish-task/main.go &
{
  "task_id": "$taskid",
  "input_path": "/input/stress/$taskid.mp4",
  "output_path": "/output/stress/$taskid-compressed.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "fast",
    "resolution": "1280x720"
  }
}
JSON
  # 每 10 个任务暂停一下，避免过快发送
  if [ $((i % 10)) -eq 0 ]; then
    sleep 1
  fi
done
wait
EOF

chmod +x stress_test.sh
./stress_test.sh
```

3. **监控系统资源**
```bash
# 查看 Docker 容器资源使用
docker stats media-processor-service

# 查看队列长度
docker-compose logs media-processor | grep "active"
```

4. **分析性能**
```bash
# 统计成功和失败
docker-compose logs media-processor | grep "Task completed" | wc -l  # 成功
docker-compose logs media-processor | grep "Error" | wc -l             # 错误

# 计算平均处理时间
docker-compose logs media-processor | grep "duration" | awk -F'"' '{print $4}' | \
  awk '{sum+=$1; count++} END {print "Average duration: " sum/count " ms"}'
```

---

## 错误处理测试

### 测试 1: 无效输入路径

```bash
cat << 'EOF' > test_invalid_input.json
{
  "task_id": "test-invalid-001",
  "input_path": "/input/nonexistent/file.mp4",
  "output_path": "/output/test/result.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 23,
    "preset": "medium"
  }
}
EOF

go run cmd/publish-task/main.go < test_invalid_input.json
docker-compose logs media-processor | grep "test-invalid-001"

# 预期: 错误日志记录，任务失败
```

### 测试 2: 超时测试

设置一个非常短的超时时间：

```bash
# 修改环境变量
export TASK_TIMEOUT_SEC=1

# 重启服务
docker-compose restart media-processor

# 发送任务
go run cmd/publish-task/main.go -type=video

# 预期: 任务在 1 秒后超时
docker-compose logs media-processor | grep "timeout"
```

### 测试 3: 优雅关闭测试

```bash
# 1. 发送一个长时间运行的任务
go run cmd/publish-task/main.go -type=video

# 2. 立即停止服务
docker-compose stop media-processor

# 3. 查看日志
docker-compose logs media-processor | tail -20

# 预期输出应包含：
# - "Shutdown signal received"
# - "All workers finished"
# - "Service shutdown complete"
```

---

## 性能基准测试

### 基准 1: 单个视频压缩

```bash
#!/bin/bash

# 创建测试视频（各种大小）
for size in 720 1080 2160; do
  ffmpeg -f lavfi -i testsrc=s="${size}p:d=60" \
         -f lavfi -i sine=f=1000:d=60 \
         -c:v libx264 -preset medium \
         -c:a aac \
         test_files/video_${size}p_60s.mp4
  
  # 上传并发送任务
  curl -X PUT -F "file=@test_files/video_${size}p_60s.mp4" \
    http://localhost:8888/input/benchmark/video_${size}p.mp4
  
  # 测量处理时间
  start_time=$(date +%s%N)
  go run cmd/publish-task/main.go -type=video
  
  # 等待完成
  docker-compose logs media-processor | tail -1
  
  end_time=$(date +%s%N)
  duration=$((($end_time - $start_time) / 1000000))
  
  echo "Video ${size}p: ${duration}ms"
done
```

---

## 常见问题排查

### Q1: 任务一直在队列中，没有被处理

```bash
# 检查：
# 1. 服务是否运行
docker-compose ps

# 2. RabbitMQ 连接是否正常
docker-compose logs media-processor | grep "RabbitMQ"

# 3. 查看队列状态
curl -u guest:guest http://localhost:15672/api/queues/%2F

# 4. 重启服务
docker-compose restart media-processor
```

### Q2: FFmpeg 超时

```bash
# 增加超时时间
export TASK_TIMEOUT_SEC=600
docker-compose up -d --force-recreate
```

### Q3: SeaweedFS 文件未找到

```bash
# 检查文件是否存在
curl -I http://localhost:8888/input/your/path/file.mp4

# 查看目录结构
curl http://localhost:8888/

# 手动创建路径
curl -X PUT -F "file=@test_file.mp4" \
  http://localhost:8888/input/test/file.mp4
```

---

## 生产环境检查清单

- [ ] 调整 MAX_WORKERS 适配 CPU 核心数
- [ ] 配置适当的 FFmpeg 预设（平衡速度和质量）
- [ ] 设置合理的任务超时时间
- [ ] 配置日志级别（生产环境建议 "warn" 或 "error"）
- [ ] 实现监控和告警（集成 Prometheus）
- [ ] 设置 RabbitMQ 消息有效期
- [ ] 配置 SeaweedFS 副本数和备份
- [ ] 实现死信队列处理失败任务
- [ ] 准备优雅关闭脚本
- [ ] 定期备份配置和日志

---

**最后更新**: 2025-02-18

