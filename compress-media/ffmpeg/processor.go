package ffmpeg

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"time"

	"go.uber.org/zap"
)

// FFmpegProcessor handles FFmpeg command execution
type FFmpegProcessor struct {
	ffmpegPath string
	logger     *zap.Logger
	timeout    time.Duration
}

// NewFFmpegProcessor creates a new FFmpeg processor
func NewFFmpegProcessor(ffmpegPath string, timeoutSec int, logger *zap.Logger) *FFmpegProcessor {
	return &FFmpegProcessor{
		ffmpegPath: ffmpegPath,
		logger:     logger,
		timeout:    time.Duration(timeoutSec) * time.Second,
	}
}

// ProcessImageStream processes an image from input stream to output stream
// Supports compression with quality parameter
func (p *FFmpegProcessor) ProcessImageStream(
	inputStream io.Reader,
	outputStream io.Writer,
	inputFormat string,
	outputFormat string,
	quality int, // 1-51 for JPEG (higher = better), default 90 for quality %
) error {
	// Build FFmpeg command for image compression
	// Input from stdin, output to stdout
	args := []string{
		"-i", "pipe:0", // Read from stdin
		"-q:v", fmt.Sprintf("%d", quality), // Quality parameter
		"-f", outputFormat,
		"pipe:1", // Write to stdout
	}

	return p.executeFFmpeg(inputStream, outputStream, args)
}

// ProcessVideoStream processes a video from input stream to output stream
// Supports H.264/H.265 encoding with CRF parameter
func (p *FFmpegProcessor) ProcessVideoStream(
	inputStream io.Reader,
	outputStream io.Writer,
	codec string, // "libx264" or "libx265"
	crf int, // 0-51, default 23 (lower = better quality, larger file)
	preset string, // "ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"
	resolution string, // "1920x1080", "1280x720", etc., empty string = original
) error {
	args := []string{
		"-i", "pipe:0", // Read from stdin
	}

	if resolution != "" {
		args = append(args, "-vf", fmt.Sprintf("scale=%s", resolution))
	}

	args = append(args,
		"-c:v", codec,
		"-crf", fmt.Sprintf("%d", crf),
		"-preset", preset,
		"-c:a", "aac", // Audio codec
		"-b:a", "128k", // Audio bitrate
		"-f", "mp4",
		"pipe:1", // Write to stdout
	)

	return p.executeFFmpeg(inputStream, outputStream, args)
}

// executeFFmpeg executes FFmpeg with piped input/output streams
func (p *FFmpegProcessor) executeFFmpeg(inputStream io.Reader, outputStream io.Writer, args []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), p.timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, p.ffmpegPath, args...)

	// Suppress FFmpeg's stderr output to reduce noise
	cmd.Stderr = os.Stderr // Change to io.Discard if you want to suppress

	// Pipe streams
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdin pipe: %w", err)
	}

	cmd.Stdout = outputStream

	// Start the process
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ffmpeg: %w", err)
	}

	// Copy input stream to FFmpeg stdin
	go func() {
		defer stdin.Close()
		if _, err := io.Copy(stdin, inputStream); err != nil {
			p.logger.Error("failed to copy input to ffmpeg", zap.Error(err))
		}
	}()

	// Wait for FFmpeg to complete
	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("ffmpeg execution failed: %w", err)
	}

	return nil
}

// timeoutContext creates a context with timeout
func timeoutContext(timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), timeout)
}

// Helper to use context.WithTimeout properly
func executeWithTimeout(timeout time.Duration, fn func() error) error {
	done := make(chan error, 1)
	go func() {
		done <- fn()
	}()

	select {
	case err := <-done:
		return err
	case <-time.After(timeout):
		return fmt.Errorf("ffmpeg execution timeout after %v", timeout)
	}
}
