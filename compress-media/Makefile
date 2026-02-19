.PHONY: help build run clean test docker-build docker-up docker-down

# Variables
GO := go
DOCKER_COMPOSE := docker-compose
BINARY_NAME := media-processor
DOCKER_IMAGE := compress-media:latest

help:
	@echo "Available commands:"
	@echo "  make build           - Build the application"
	@echo "  make run             - Run the application locally"
	@echo "  make test            - Run tests"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-up       - Start services with docker-compose"
	@echo "  make docker-down     - Stop services with docker-compose"
	@echo "  make docker-logs     - View service logs"
	@echo "  make fmt             - Format code"
	@echo "  make lint            - Run linter"
	@echo "  make publish-test    - Publish a test task"

# Build targets
build:
	$(GO) build -o $(BINARY_NAME) main.go

run: build
	./$(BINARY_NAME)

# Development targets
fmt:
	$(GO) fmt ./...

lint:
	@command -v golangci-lint >/dev/null 2>&1 || (echo "golangci-lint not found, installing..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run

test:
	$(GO) test -v -race -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html

clean:
	$(GO) clean
	rm -f $(BINARY_NAME) coverage.out coverage.html

# Docker targets
docker-build:
	docker build -t $(DOCKER_IMAGE) .

docker-up:
	$(DOCKER_COMPOSE) up -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f media-processor

docker-restart:
	$(DOCKER_COMPOSE) restart media-processor

# Testing targets
publish-test:
	$(GO) run cmd/publish-task/main.go -type=video

publish-test-image:
	$(GO) run cmd/publish-task/main.go -type=image

# Development environment setup
setup:
	$(GO) mod download
	$(GO) mod tidy

# Code generation (if needed in future)
generate:
	$(GO) generate ./...

# Version and build info
version:
	@echo "Building $(BINARY_NAME)..."
	@$(GO) version

