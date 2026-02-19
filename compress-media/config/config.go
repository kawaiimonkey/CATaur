package config

import (
	"os"
	"strconv"
)

// Config holds the application configuration
type Config struct {
	// RabbitMQ
	RabbitMQURL   string
	QueueName     string
	ConsumerCount int

	// SeaweedFS
	SeaweedFSURL string

	// FFmpeg
	MaxWorkers     int
	FFmpegPath     string
	TaskTimeoutSec int

	// Server
	LogLevel string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		RabbitMQURL:   getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"),
		QueueName:     getEnv("QUEUE_NAME", "media-compress-tasks"),
		ConsumerCount: getEnvInt("CONSUMER_COUNT", 1),

		SeaweedFSURL: getEnv("SEAWEEDFS_URL", "http://seaweedfs:8888"),

		MaxWorkers:     getEnvInt("MAX_WORKERS", 4),
		FFmpegPath:     getEnv("FFMPEG_PATH", "ffmpeg"),
		TaskTimeoutSec: getEnvInt("TASK_TIMEOUT_SEC", 300),

		LogLevel: getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, ok := os.LookupEnv(key); ok {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
