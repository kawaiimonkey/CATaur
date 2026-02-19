# API 文档与扩展指南

## RabbitMQ 消息 API

### 任务消息结构

所有任务消息通过 RabbitMQ 队列发送，格式为 JSON。

```typescript
interface Task {
  task_id: string;                          // 唯一任务 ID
  input_path: string;                       // SeaweedFS 输入路径
  output_path: string;                      // SeaweedFS 输出路径
  media_type: "image" | "video";            // 媒体类型
  format: string;                           // 输出格式 (jpg, png, mp4, etc)
  compression_params: Record<string, any>;  // 压缩参数
}
```

### 视频压缩参数

```typescript
interface VideoCompressionParams {
  codec: "libx264" | "libx265";     // H.264 或 H.265 编码器
  crf: number;                       // 质量参数 (0-51, 默认 23)
  preset: string;                    // 编码速度预设
  resolution?: string;               // 输出分辨率 (可选)
  bitrate?: string;                  // 比特率 (可选, 如 "2000k")
  fps?: number;                      // 帧率 (可选)
}
```

**Preset 选项** (从快到慢):
- `ultrafast`: 最快编码，质量最低
- `superfast`
- `veryfast`
- `faster`
- `fast`
- `medium`: 平衡（推荐）
- `slow`
- `slower`
- `veryslow`: 最慢编码，质量最高

**CRF 值指南**:
- 0-15: 超高质量，文件很大
- 18-23: 高质量，推荐范围
- 28-35: 中等质量，文件较小
- 36-51: 低质量，文件很小

### 图片压缩参数

```typescript
interface ImageCompressionParams {
  quality: number;                   // JPEG 质量 (1-100, 推荐 80-95)
  resize?: string;                   // 重新调整大小 (如 "1920x1080")
}
```

---

## 消息发送示例

### 使用 Go 代码

```go
package main

import (
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Task struct {
	TaskID            string                 `json:"task_id"`
	InputPath         string                 `json:"input_path"`
	OutputPath        string                 `json:"output_path"`
	MediaType         string                 `json:"media_type"`
	Format            string                 `json:"format"`
	CompressionParams map[string]interface{} `json:"compression_params"`
}

func main() {
	// 连接 RabbitMQ
	conn, _ := amqp.Dial("amqp://guest:guest@localhost:5672/")
	defer conn.Close()

	ch, _ := conn.Channel()
	defer ch.Close()

	// 声明队列
	ch.QueueDeclare("media-compress-tasks", true, false, false, false, nil)

	// 创建任务
	task := Task{
		TaskID:     "my-task-001",
		InputPath:  "/input/task-001/video.mp4",
		OutputPath: "/output/task-001/compressed.mp4",
		MediaType:  "video",
		Format:     "mp4",
		CompressionParams: map[string]interface{}{
			"codec":   "libx264",
			"crf":     23,
			"preset":  "medium",
			"resolution": "1280x720",
		},
	}

	// 序列化并发送
	body, _ := json.Marshal(task)
	ch.PublishWithContext(
		nil,
		"",
		"media-compress-tasks",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)

	fmt.Println("Task published!")
}
```

### 使用 Python

```python
import pika
import json

# 连接 RabbitMQ
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# 声明队列
channel.queue_declare(queue='media-compress-tasks', durable=True)

# 创建任务
task = {
    "task_id": "my-task-001",
    "input_path": "/input/task-001/video.mp4",
    "output_path": "/output/task-001/compressed.mp4",
    "media_type": "video",
    "format": "mp4",
    "compression_params": {
        "codec": "libx264",
        "crf": 23,
        "preset": "medium",
        "resolution": "1280x720"
    }
}

# 发送任务
channel.basic_publish(
    exchange='',
    routing_key='media-compress-tasks',
    body=json.dumps(task),
    properties=pika.BasicProperties(content_type='application/json')
)

print("Task published!")
connection.close()
```

### 使用 cURL

```bash
# 首先需要启用 RabbitMQ HTTP API 插件
docker exec <container-id> rabbitmq-plugins enable rabbitmq_management

# 然后发送消息
PAYLOAD='eyJ0YXNrX2lkIjoibXktdGFzay0wMDEiLCJpbnB1dF9wYXRoIjoiL2lucHV0L3Rhc2stMDAxL3ZpZGVvLm1wNCIsIm91dHB1dF9wYXRoIjoiL291dHB1dC90YXNrLTAwMS9jb21wcmVzc2VkLm1wNCIsIm1lZGlhX3R5cGUiOiJ2aWRlbyIsImZvcm1hdCI6Im1wNCIsImNvbXByZXNzaW9uX3BhcmFtcyI6eyJjb2RlYyI6ImxpYng4Y2FyZSIsImNyZiI6MjMsInByZXNldCI6Im1lZGl1bSIsInJlc29sdXRpb24iOiIxMjgweDcyMCJ9fQ=='

curl -u guest:guest \
  -H "content-type:application/json" \
  -X POST http://localhost:15672/api/exchanges/%2F/amq.default/publish \
  -d "{
    \"properties\":{},
    \"routing_key\":\"media-compress-tasks\",
    \"payload\":\"$PAYLOAD\",
    \"payload_encoding\":\"base64\"
  }"
```

---

## 内部 Go API 参考

### Config 包

```go
package config

type Config struct {
    RabbitMQURL      string
    QueueName        string
    ConsumerCount    int
    SeaweedFSURL     string
    MaxWorkers       int
    FFmpegPath       string
    TaskTimeoutSec   int
    LogLevel         string
}

func LoadConfig() *Config
```

### Storage 包

```go
package storage

type SeaweedFSClient struct { ... }

func NewSeaweedFSClient(baseURL string) *SeaweedFSClient

// 获取文件流
func (c *SeaweedFSClient) GetFileStream(path string) (io.ReadCloser, error)

// 上传文件流
func (c *SeaweedFSClient) PutFileStream(path string, reader io.Reader) error

// 检查文件存在性
func (c *SeaweedFSClient) FileExists(path string) (bool, error)
```

### FFmpeg 包

```go
package ffmpeg

type FFmpegProcessor struct { ... }

func NewFFmpegProcessor(ffmpegPath string, timeoutSec int, logger *zap.Logger) *FFmpegProcessor

// 处理图片流
func (p *FFmpegProcessor) ProcessImageStream(
    inputStream io.Reader,
    outputStream io.Writer,
    inputFormat string,
    outputFormat string,
    quality int,
) error

// 处理视频流
func (p *FFmpegProcessor) ProcessVideoStream(
    inputStream io.Reader,
    outputStream io.Writer,
    codec string,
    crf int,
    preset string,
    resolution string,
) error
```

### Workers 包

```go
package workers

type WorkerPool struct { ... }

func NewWorkerPool(
    maxWorkers int,
    ffmpegProcessor *ffmpeg.FFmpegProcessor,
    storageClient *storage.SeaweedFSClient,
    logger *zap.Logger,
) *WorkerPool

// 启动 worker pool
func (wp *WorkerPool) Start()

// 提交任务
func (wp *WorkerPool) Submit(task *models.Task) error

// 优雅关闭
func (wp *WorkerPool) Shutdown(ctx context.Context) error

// 获取活跃 worker 数量
func (wp *WorkerPool) GetActiveWorkerCount() int32
```

### Messaging 包

```go
package messaging

type RabbitMQConsumer struct { ... }

func NewRabbitMQConsumer(url, queueName string, logger *zap.Logger) (*RabbitMQConsumer, error)

// 开始消费消息
func (r *RabbitMQConsumer) Consume(ctx context.Context, consumerTag string) (<-chan *models.Task, <-chan error, error)

// 关闭连接
func (r *RabbitMQConsumer) Close() error

// 发布任务（用于测试）
func (r *RabbitMQConsumer) PublishTask(task *models.Task) error
```

---

## 扩展指南

### 1. 添加新的媒体格式支持

**步骤**:

1. 在 `ffmpeg/processor.go` 中添加新方法：

```go
// ProcessAudioStream 处理音频流
func (p *FFmpegProcessor) ProcessAudioStream(
    inputStream io.Reader,
    outputStream io.Writer,
    codec string,    // "aac", "libmp3lame", "libopus"
    bitrate string,  // "128k", "256k"
) error {
    args := []string{
        "-i", "pipe:0",
        "-c:a", codec,
        "-b:a", bitrate,
        "-f", "mp3",
        "pipe:1",
    }
    return p.executeFFmpeg(inputStream, outputStream, args)
}
```

2. 在 `workers/pool.go` 中更新 `processTask` 方法：

```go
case "audio":
    codec := getParamString(task.CompressionParams, "codec", "libmp3lame")
    bitrate := getParamString(task.CompressionParams, "bitrate", "128k")
    errChan <- wp.ffmpegProcessor.ProcessAudioStream(
        inputStream,
        pipeWriter,
        codec,
        bitrate,
    )
```

### 2. 实现任务结果回调

**创建文件 `callback/notifier.go`**:

```go
package callback

import (
    "encoding/json"
    "fmt"
    "net/http"
    "go.uber.org/zap"
    "compress-media/models"
)

type Notifier struct {
    callbackURL string
    logger      *zap.Logger
}

func NewNotifier(callbackURL string, logger *zap.Logger) *Notifier {
    return &Notifier{
        callbackURL: callbackURL,
        logger:      logger,
    }
}

type TaskResult struct {
    TaskID     string `json:"task_id"`
    Success    bool   `json:"success"`
    Message    string `json:"message"`
    OutputPath string `json:"output_path,omitempty"`
    Duration   int64  `json:"duration_ms"`
}

func (n *Notifier) Notify(result *TaskResult) error {
    body, _ := json.Marshal(result)
    resp, err := http.Post(
        n.callbackURL,
        "application/json",
        bytes.NewReader(body),
    )
    if err != nil {
        n.logger.Error("Failed to send callback", zap.Error(err))
        return err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        return fmt.Errorf("callback returned status %d", resp.StatusCode)
    }
    return nil
}
```

在 `workers/pool.go` 中使用：

```go
type WorkerPool struct {
    // ... existing fields ...
    notifier *callback.Notifier
}

// 在 processTask 完成后
n.Notify(&callback.TaskResult{
    TaskID:     task.TaskID,
    Success:    true,
    OutputPath: task.OutputPath,
    Duration:   int64(time.Since(startTime).Milliseconds()),
})
```

### 3. 添加 Prometheus 监控

**创建文件 `metrics/metrics.go`**:

```go
package metrics

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

type Metrics struct {
    TasksProcessed   prometheus.Counter
    TasksFailed      prometheus.Counter
    ProcessingTime   prometheus.Histogram
    ActiveWorkers    prometheus.Gauge
}

func NewMetrics() *Metrics {
    return &Metrics{
        TasksProcessed: promauto.NewCounter(prometheus.CounterOpts{
            Name: "media_processor_tasks_processed_total",
            Help: "Total number of tasks processed",
        }),
        TasksFailed: promauto.NewCounter(prometheus.CounterOpts{
            Name: "media_processor_tasks_failed_total",
            Help: "Total number of failed tasks",
        }),
        ProcessingTime: promauto.NewHistogram(prometheus.HistogramOpts{
            Name: "media_processor_processing_time_seconds",
            Help: "Task processing time in seconds",
        }),
        ActiveWorkers: promauto.NewGauge(prometheus.GaugeOpts{
            Name: "media_processor_active_workers",
            Help: "Number of active workers",
        }),
    }
}
```

### 4. 实现死信队列 (DLQ)

在 `messaging/rabbitmq.go` 中：

```go
// 声明死信交换机和队列
func (r *RabbitMQConsumer) SetupDLQ() error {
    // 声明死信交换机
    err := r.channel.ExchangeDeclare(
        "dlx-exchange",
        "direct",
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        return err
    }

    // 声明死信队列
    _, err = r.channel.QueueDeclare(
        "media-compress-tasks-dlq",
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        return err
    }

    // 绑定队列到交换机
    return r.channel.QueueBind(
        "media-compress-tasks-dlq",
        "dlx",
        "dlx-exchange",
        false,
        nil,
    )
}

// 设置主队列指向 DLQ
func (r *RabbitMQConsumer) DeclareQueueWithDLX() error {
    _, err := r.channel.QueueDeclare(
        r.queueName,
        true,
        false,
        false,
        false,
        amqp.Table{
            "x-dead-letter-exchange":    "dlx-exchange",
            "x-message-ttl":             3600000, // 1 小时
            "x-max-length":              10000,   // 最多 10000 条消息
        },
    )
    return err
}
```

### 5. 添加 Web 管理界面

创建一个简单的 HTTP 服务器来提供状态信息：

```go
// 在 main.go 中添加

import "net/http"

func startStatusServer(pool *workers.WorkerPool) {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "status": "ok",
            "active_workers": pool.GetActiveWorkerCount(),
        })
    })

    http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "active_workers": pool.GetActiveWorkerCount(),
            "timestamp": time.Now(),
        })
    })

    go http.ListenAndServe(":8080", nil)
}
```

---

## 性能调优技巧

### 1. FFmpeg 优化

```go
// 使用硬件加速（如果可用）
args := []string{
    "-hwaccel", "cuda",        // 使用 NVIDIA GPU
    "-i", "pipe:0",
    // ...
}

// 或使用 Intel 硬件编码
"-c:v", "h264_qsv",
"-i", "pipe:0",
```

### 2. 内存优化

```go
// 减少 SeaweedFS 缓冲区大小
client.GetFileStream(path) // 使用默认缓冲

// 限制 Worker 数量防止内存溢出
MaxWorkers: runtime.NumCPU(),
```

### 3. 并发优化

```go
// 根据 CPU 核心数调整
import "runtime"

maxWorkers := runtime.NumCPU() - 1 // 留一个核心给系统
```

---

**最后更新**: 2025-02-18

