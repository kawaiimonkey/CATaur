package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Task represents a media compression task
type Task struct {
	TaskID            string                 `json:"task_id"`
	InputPath         string                 `json:"input_path"`
	OutputPath        string                 `json:"output_path"`
	MediaType         string                 `json:"media_type"`
	Format            string                 `json:"format"`
	CompressionParams map[string]interface{} `json:"compression_params"`
}

func main() {
	// Parse flags
	rabbitmqURL := flag.String("rabbitmq", "amqp://guest:guest@localhost:5672/", "RabbitMQ URL")
	queueName := flag.String("queue", "media-compress-tasks", "Queue name")
	taskType := flag.String("type", "video", "Task type: video or image")
	flag.Parse()

	// Connect to RabbitMQ
	conn, err := amqp.Dial(*rabbitmqURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	channel, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}
	defer channel.Close()

	// Declare queue
	q, err := channel.QueueDeclare(*queueName, true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	// Create task based on type
	var task Task

	switch *taskType {
	case "video":
		task = Task{
			TaskID:     "test-video-001",
			InputPath:  "/input/test-video/sample.mp4",
			OutputPath: "/output/test-video/sample-compressed.mp4",
			MediaType:  "video",
			Format:     "mp4",
			CompressionParams: map[string]interface{}{
				"codec":      "libx264",
				"crf":        28,
				"preset":     "medium",
				"resolution": "1280x720",
			},
		}

	case "image":
		task = Task{
			TaskID:     "test-image-001",
			InputPath:  "/input/test-image/photo.jpg",
			OutputPath: "/output/test-image/photo-compressed.jpg",
			MediaType:  "image",
			Format:     "jpg",
			CompressionParams: map[string]interface{}{
				"quality": 85,
			},
		}

	default:
		fmt.Printf("Unknown task type: %s\n", *taskType)
		os.Exit(1)
	}

	// Marshal task to JSON
	body, err := json.Marshal(task)
	if err != nil {
		log.Fatalf("Failed to marshal task: %v", err)
	}

	// Publish message
	err = channel.PublishWithContext(
		nil,
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		log.Fatalf("Failed to publish message: %v", err)
	}

	fmt.Printf("Task published successfully!\n")
	fmt.Printf("Task ID: %s\n", task.TaskID)
	fmt.Printf("Type: %s\n", task.MediaType)
	fmt.Printf("Input: %s\n", task.InputPath)
	fmt.Printf("Output: %s\n", task.OutputPath)
}
