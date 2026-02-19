package messaging

import (
	"context"
	"encoding/json"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"

	"compress-media/models"
)

// RabbitMQConsumer handles RabbitMQ connection and consumption
type RabbitMQConsumer struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	queueName string
	logger    *zap.Logger
}

// NewRabbitMQConsumer creates and initializes a new RabbitMQ consumer
func NewRabbitMQConsumer(url, queueName string, logger *zap.Logger) (*RabbitMQConsumer, error) {
	// Connect to RabbitMQ
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// Create a channel
	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	// Declare the queue (idempotent operation)
	queue, err := channel.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // auto-delete
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare queue: %w", err)
	}

	logger.Info("Queue declared", zap.String("queue_name", queue.Name))

	return &RabbitMQConsumer{
		conn:      conn,
		channel:   channel,
		queueName: queueName,
		logger:    logger,
	}, nil
}

// Consume starts consuming messages from the queue
// Returns a channel that will receive Task messages
func (r *RabbitMQConsumer) Consume(ctx context.Context, consumerTag string) (<-chan *models.Task, <-chan error, error) {
	// Set QoS to control prefetch count
	err := r.channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to set QoS: %w", err)
	}

	// Start consuming messages
	msgs, err := r.channel.Consume(
		r.queueName, // queue
		consumerTag, // consumer tag
		false,       // auto-ack (we'll ack manually)
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to consume messages: %w", err)
	}

	taskChan := make(chan *models.Task)
	errChan := make(chan error)

	// Process messages in a goroutine
	go func() {
		defer close(taskChan)
		defer close(errChan)

		for {
			select {
			case <-ctx.Done():
				r.logger.Info("Consume context cancelled")
				return
			case msg, ok := <-msgs:
				if !ok {
					r.logger.Info("Message channel closed")
					return
				}

				// Parse the message
				var task models.Task
				if err := json.Unmarshal(msg.Body, &task); err != nil {
					r.logger.Error("Failed to unmarshal message", zap.Error(err))
					// Nack the message and requeue
					msg.Nack(false, true)
					continue
				}

				r.logger.Info("Received task", zap.String("task_id", task.TaskID))

				// Send task to channel
				select {
				case taskChan <- &task:
					// Message will be acked after processing
					// We pass the delivery so the caller can ack
					_ = msg.Ack(false)
				case <-ctx.Done():
					// Context cancelled, nack the message for requeue
					msg.Nack(false, true)
					return
				}
			}
		}
	}()

	return taskChan, errChan, nil
}

// Close closes the RabbitMQ connection
func (r *RabbitMQConsumer) Close() error {
	if r.channel != nil {
		if err := r.channel.Close(); err != nil {
			r.logger.Error("Failed to close channel", zap.Error(err))
		}
	}
	if r.conn != nil {
		if err := r.conn.Close(); err != nil {
			r.logger.Error("Failed to close connection", zap.Error(err))
			return err
		}
	}
	return nil
}

// PublishTask publishes a task to the queue (useful for testing)
func (r *RabbitMQConsumer) PublishTask(task *models.Task) error {
	body, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("failed to marshal task: %w", err)
	}

	err = r.channel.PublishWithContext(
		context.Background(),
		"",          // exchange
		r.queueName, // routing key
		false,       // mandatory
		false,       // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish task: %w", err)
	}

	return nil
}
