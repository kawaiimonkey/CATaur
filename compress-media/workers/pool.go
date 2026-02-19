package workers

import (
	"context"
	"fmt"
	"io"
	"sync"
	"sync/atomic"
	"time"

	"go.uber.org/zap"

	"compress-media/ffmpeg"
	"compress-media/models"
	"compress-media/storage"
)

// WorkerPool manages a pool of worker goroutines for processing tasks
type WorkerPool struct {
	maxWorkers      int32
	activeWorkers   int32
	taskQueue       chan *models.Task
	wg              sync.WaitGroup
	ctx             context.Context
	cancel          context.CancelFunc
	logger          *zap.Logger
	ffmpegProcessor *ffmpeg.FFmpegProcessor
	storageClient   *storage.SeaweedFSClient
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(
	maxWorkers int,
	ffmpegProcessor *ffmpeg.FFmpegProcessor,
	storageClient *storage.SeaweedFSClient,
	logger *zap.Logger,
) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())

	return &WorkerPool{
		maxWorkers:      int32(maxWorkers),
		taskQueue:       make(chan *models.Task, maxWorkers*2), // Buffered queue
		ctx:             ctx,
		cancel:          cancel,
		logger:          logger,
		ffmpegProcessor: ffmpegProcessor,
		storageClient:   storageClient,
	}
}

// Start starts the worker goroutines
func (wp *WorkerPool) Start() {
	for i := 0; i < int(wp.maxWorkers); i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
	wp.logger.Info("Worker pool started", zap.Int32("max_workers", wp.maxWorkers))
}

// Submit submits a task to the worker pool
func (wp *WorkerPool) Submit(task *models.Task) error {
	select {
	case wp.taskQueue <- task:
		return nil
	case <-wp.ctx.Done():
		return context.Canceled
	}
}

// worker processes tasks from the queue
func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()

	for {
		select {
		case task, ok := <-wp.taskQueue:
			if !ok {
				wp.logger.Info("Worker exiting", zap.Int("worker_id", id))
				return
			}

			atomic.AddInt32(&wp.activeWorkers, 1)
			wp.processTask(task)
			atomic.AddInt32(&wp.activeWorkers, -1)

		case <-wp.ctx.Done():
			wp.logger.Info("Worker context cancelled", zap.Int("worker_id", id))
			return
		}
	}
}

// processTask processes a single task and overwrites the original file
func (wp *WorkerPool) processTask(task *models.Task) {
	startTime := time.Now()
	logger := wp.logger.With(zap.String("task_id", task.TaskID))

	logger.Info("Processing task",
		zap.String("media_type", task.MediaType),
		zap.String("format", task.Format),
		zap.String("file_path", task.InputPath),
	)

	// Get input file from SeaweedFS
	inputStream, err := wp.storageClient.GetFileStream(task.InputPath)
	if err != nil {
		logger.Error("Failed to get input file", zap.Error(err))
		return
	}
	defer inputStream.Close()

	// Create a pipe for FFmpeg output
	pipeReader, pipeWriter := io.Pipe()

	// Channel to handle async FFmpeg execution
	errChan := make(chan error, 1)

	// Run FFmpeg processing in a goroutine
	go func() {
		defer pipeWriter.Close()

		switch task.MediaType {
		case "image":
			quality := getParamInt(task.CompressionParams, "quality", 90)
			errChan <- wp.ffmpegProcessor.ProcessImageStream(
				inputStream,
				pipeWriter,
				task.Format,
				task.Format,
				quality,
			)

		case "video":
			codec := getParamString(task.CompressionParams, "codec", "libx264")
			crf := getParamInt(task.CompressionParams, "crf", 23)
			preset := getParamString(task.CompressionParams, "preset", "medium")
			resolution := getParamString(task.CompressionParams, "resolution", "")

			errChan <- wp.ffmpegProcessor.ProcessVideoStream(
				inputStream,
				pipeWriter,
				codec,
				crf,
				preset,
				resolution,
			)

		default:
			errChan <- fmt.Errorf("unsupported media type: %s", task.MediaType)
		}
	}()

	// Upload (overwrite) the file to SeaweedFS using the same path
	// This will replace the original file with the compressed version
	if err := wp.storageClient.PutFileStream(task.InputPath, pipeReader); err != nil {
		logger.Error("Failed to upload compressed file", zap.Error(err))
		pipeReader.Close()
		return
	}

	// Wait for FFmpeg to complete
	if err := <-errChan; err != nil {
		logger.Error("FFmpeg processing failed", zap.Error(err))
		return
	}

	duration := time.Since(startTime)
	logger.Info("Task completed successfully",
		zap.Duration("duration", duration),
		zap.String("file_path", task.InputPath),
	)
}

// Shutdown gracefully shuts down the worker pool
func (wp *WorkerPool) Shutdown(ctx context.Context) error {
	wp.logger.Info("Shutting down worker pool")

	// Stop accepting new tasks
	wp.cancel()

	// Wait for all workers to finish with a timeout
	done := make(chan struct{})
	go func() {
		wp.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		wp.logger.Info("All workers finished")
		return nil
	case <-ctx.Done():
		wp.logger.Warn("Shutdown timeout, forcing termination")
		return ctx.Err()
	}
}

// GetActiveWorkerCount returns the number of active workers
func (wp *WorkerPool) GetActiveWorkerCount() int32 {
	return atomic.LoadInt32(&wp.activeWorkers)
}

// Helper functions
func getParamString(params map[string]interface{}, key, defaultVal string) string {
	if val, ok := params[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return defaultVal
}

func getParamInt(params map[string]interface{}, key string, defaultVal int) int {
	if val, ok := params[key]; ok {
		switch v := val.(type) {
		case float64:
			return int(v)
		case int:
			return v
		}
	}
	return defaultVal
}
