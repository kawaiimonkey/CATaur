# 更新说明 - 文件覆盖模式

## 📝 工作流程变化

之前的设计是：
```
输入文件 → 压缩处理 → 输出到新文件
/seaweedfs/input/file.mp4 → 处理 → /seaweedfs/output/file.mp4
```

现在的设计是：
```
输入文件 → 压缩处理 → 覆盖原文件
/seaweedfs/media/file.mp4 → 处理 → /seaweedfs/media/file.mp4（被替换）
```

## ✨ 变化总结

### 任务结构简化

**之前的任务格式：**
```json
{
  "task_id": "task-001",
  "input_path": "/input/video.mp4",
  "output_path": "/output/video-compressed.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium"
  }
}
```

**现在的任务格式：**
```json
{
  "task_id": "task-001",
  "input_path": "/media/video.mp4",
  "media_type": "video",
  "format": "mp4",
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium"
  }
}
```

**改动：**
- ❌ 移除了 `output_path` 字段
- ✅ 文件在 `input_path` 位置直接被压缩版本覆盖

### 代码变化

#### models/task.go
- 移除 `OutputPath` 字段
- 更新 `TaskResult` 的 `OutputPath` → `FilePath`

#### workers/pool.go
- `processTask()` 现在使用 `task.InputPath` 作为上传目标
- 压缩后的文件直接覆盖原文件

```go
// 之前：
wp.storageClient.PutFileStream(task.OutputPath, pipeReader)

// 现在：
wp.storageClient.PutFileStream(task.InputPath, pipeReader)
```

#### cmd/publish-task/main.go
- 移除了任务创建中的 `OutputPath` 赋值
- 简化了输出信息

## 🚀 使用示例

### 1. 准备文件

```bash
# 上传文件到 SeaweedFS
curl -X PUT -F "file=@myVideo.mp4" http://127.0.0.1:8888/media/myVideo.mp4

# 验证文件存在
curl -I http://127.0.0.1:8888/media/myVideo.mp4
```

### 2. 发送压缩任务

```bash
# 使用发布工具
go run cmd/publish-task/main.go -type=video

# 或手动发送 JSON 任务
curl -u guest:guest -H "content-type:application/json" \
  -XPOST http://localhost:15672/api/exchanges/%2f/amq.default/publish \
  -d'{
    "properties":{},
    "routing_key":"media-compress-tasks",
    "payload":"eyJ0YXNrX2lkIjoidGFzay0wMDEiLCJpbnB1dF9wYXRoIjoiL21lZGlhL215VmlkZW8ubXA0IiwibWVkaWFfdHlwZSI6InZpZGVvIiwiZm9ybWF0IjoibXA0IiwiY29tcHJlc3Npb25fcGFyYW1zIjp7ImNvZGVjIjoibGlieDI2NCIsImNyZiI6MjgsInByZXNldCI6Im1lZGl1bSJ9fQ==",
    "payload_encoding":"base64"
  }'
```

### 3. 监控处理

```bash
# 查看日志
docker-compose logs -f media-processor

# 预期输出：
# Processing task task_id=task-001 media_type=video format=mp4 file_path=/media/myVideo.mp4
# Task completed successfully duration=45.234s file_path=/media/myVideo.mp4
```

### 4. 验证结果

```bash
# 下载压缩后的文件（应该更小）
curl -o myVideo-compressed.mp4 http://127.0.0.1:8888/media/myVideo.mp4

# 检查文件大小
ls -lh myVideo-compressed.mp4
```

## 📊 路径约定建议

### 推荐目录结构

```
/media/                    # 所有媒体文件
├── /media/videos/         # 视频文件
│   ├── /media/videos/project1/
│   └── /media/videos/project2/
├── /media/images/         # 图片文件
│   ├── /media/images/project1/
│   └── /media/images/project2/
└── /media/archive/        # 已处理的文件备份（可选）
```

### 任务示例

**视频压缩：**
```json
{
  "task_id": "compress-video-20250218-001",
  "input_path": "/media/videos/project1/intro.mp4",
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

**图片压缩：**
```json
{
  "task_id": "compress-image-20250218-001",
  "input_path": "/media/images/project1/photo.jpg",
  "media_type": "image",
  "format": "jpg",
  "compression_params": {
    "quality": 85
  }
}
```

## ⚠️ 重要注意事项

### 1. 文件不可恢复
- ❌ 压缩后的文件会直接覆盖原文件
- ✅ 建议先备份重要文件到其他位置

### 2. 并发处理安全
- ✅ 同一文件的并发处理是安全的（SeaweedFS PUT 会自动覆盖）
- ⚠️ 但不建议对同一文件同时发送多个压缩任务

### 3. 错误处理
- 如果处理失败，SeaweedFS 中的原文件**不会被修改**
- 处理失败的文件将保持原始大小

## 🔄 批量处理示例

```bash
#!/bin/bash

# 批量压缩指定目录中的所有视频

for file in /local/videos/*.mp4; do
  filename=$(basename "$file")
  
  # 1. 上传文件到 SeaweedFS
  curl -X PUT -F "file=@$file" \
    http://127.0.0.1:8888/media/videos/"$filename"
  
  # 2. 发送压缩任务
  TASK_JSON='{
    "task_id": "batch-'$(date +%s)-${filename%.*}'",
    "input_path": "/media/videos/'$filename'",
    "media_type": "video",
    "format": "mp4",
    "compression_params": {
      "codec": "libx264",
      "crf": 28,
      "preset": "medium"
    }
  }'
  
  echo "$TASK_JSON" | go run cmd/publish-task/main.go
  
  # 稍作等待，避免过快
  sleep 2
done
```

## 📈 性能建议

### 对于不同的场景

**快速处理（优先级）：**
```json
{
  "compression_params": {
    "codec": "libx264",
    "crf": 32,
    "preset": "fast",
    "resolution": "1280x720"
  }
}
```

**平衡处理（推荐）：**
```json
{
  "compression_params": {
    "codec": "libx264",
    "crf": 28,
    "preset": "medium"
  }
}
```

**最高质量：**
```json
{
  "compression_params": {
    "codec": "libx265",
    "crf": 23,
    "preset": "slow"
  }
}
```

## ✅ 验证检查清单

- [ ] 修改了任务 JSON 格式（移除 output_path）
- [ ] 更新了发布脚本
- [ ] 重新编译了应用 (`go build`)
- [ ] 创建了 SeaweedFS 中的目录结构
- [ ] 上传了测试文件到 SeaweedFS
- [ ] 发送了压缩任务
- [ ] 验证了文件被覆盖而不是创建新文件

## 📞 常见问题

**Q: 能否保留原文件并创建压缩副本？**  
A: 不能。当前设计是直接覆盖。如果需要保留原文件，请在发送任务前进行备份。

**Q: 多个任务处理同一个文件会怎样？**  
A: 最后完成的任务的结果会覆盖之前的结果。不建议这样做。

**Q: 失败的任务会删除原文件吗？**  
A: 不会。如果处理失败，原文件保持不变。

---

**更新日期**: 2025-02-18  
**版本**: 2.0 - 文件覆盖模式

