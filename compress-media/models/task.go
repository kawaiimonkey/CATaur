package models

// Task represents a media compression task from RabbitMQ
type Task struct {
	TaskID            string                 `json:"task_id"`
	InputPath         string                 `json:"input_path"`         // SeaweedFS path to file (will be overwritten after compression)
	MediaType         string                 `json:"media_type"`         // "image" or "video"
	Format            string                 `json:"format"`             // "jpg", "png", "mp4", "h265", etc.
	CompressionParams map[string]interface{} `json:"compression_params"` // CRF, quality, resolution, etc.
}

// TaskResult represents the result of a processed task
type TaskResult struct {
	TaskID   string `json:"task_id"`
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	FilePath string `json:"file_path,omitempty"` // Path to the compressed file (same as input)
	Duration int64  `json:"duration_ms"`         // Processing time in milliseconds
}
