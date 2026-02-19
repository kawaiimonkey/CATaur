package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"compress-media/config"
	"compress-media/ffmpeg"
	"compress-media/logger"
	"compress-media/messaging"
	"compress-media/storage"
	"compress-media/workers"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize logger
	log, err := logger.InitLogger(cfg.LogLevel)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer log.Sync()

	log.Info("Starting media compression service",
		zap.String("rabbitmq_url", cfg.RabbitMQURL),
		zap.String("seaweedfs_url", cfg.SeaweedFSURL),
		zap.Int("max_workers", cfg.MaxWorkers),
	)

	// Initialize RabbitMQ consumer
	consumer, err := messaging.NewRabbitMQConsumer(cfg.RabbitMQURL, cfg.QueueName, log)
	if err != nil {
		log.Fatal("Failed to create RabbitMQ consumer", zap.Error(err))
	}
	defer consumer.Close()

	// Initialize SeaweedFS client
	storageClient := storage.NewSeaweedFSClient(cfg.SeaweedFSURL)

	// Initialize FFmpeg processor
	ffmpegProcessor := ffmpeg.NewFFmpegProcessor(cfg.FFmpegPath, cfg.TaskTimeoutSec, log)

	// Create worker pool
	pool := workers.NewWorkerPool(cfg.MaxWorkers, ffmpegProcessor, storageClient, log)
	pool.Start()

	// Set up graceful shutdown
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	// Create context for consumer
	consumerCtx, consumerCancel := context.WithCancel(context.Background())
	defer consumerCancel()

	// Start consuming messages
	taskChan, errChan, err := consumer.Consume(consumerCtx, "media-processor")
	if err != nil {
		log.Fatal("Failed to start consuming messages", zap.Error(err))
	}

	log.Info("Service started and listening for tasks")

	// Main event loop
	for {
		select {
		case task := <-taskChan:
			if task != nil {
				// Submit task to worker pool
				if err := pool.Submit(task); err != nil {
					log.Error("Failed to submit task to pool", zap.Error(err), zap.String("task_id", task.TaskID))
				}
			}

		case err := <-errChan:
			if err != nil {
				log.Error("Error from consumer", zap.Error(err))
			}

		case <-shutdownChan:
			log.Info("Shutdown signal received")
			gracefulShutdown(consumerCancel, consumer, pool, log)
			return
		}
	}
}

// gracefulShutdown performs a graceful shutdown of the service
func gracefulShutdown(consumerCancel context.CancelFunc, consumer *messaging.RabbitMQConsumer, pool *workers.WorkerPool, log *zap.Logger) {
	// Stop accepting new messages
	consumerCancel()

	// Create a timeout context for shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Wait for worker pool to finish
	if err := pool.Shutdown(shutdownCtx); err != nil {
		log.Error("Error during worker pool shutdown", zap.Error(err))
	}

	// Close RabbitMQ connection
	if err := consumer.Close(); err != nil {
		log.Error("Error closing RabbitMQ connection", zap.Error(err))
	}

	log.Info("Service shutdown complete")
}
