package storage

import (
	"fmt"
	"io"
	"net/http"
)

// SeaweedFSClient handles file operations with SeaweedFS
type SeaweedFSClient struct {
	baseURL string
}

// NewSeaweedFSClient creates a new SeaweedFS client
func NewSeaweedFSClient(baseURL string) *SeaweedFSClient {
	return &SeaweedFSClient{
		baseURL: baseURL,
	}
}

// GetFileStream retrieves a file from SeaweedFS and returns a stream
// Example path: /input/task123/video.mp4
func (c *SeaweedFSClient) GetFileStream(path string) (io.ReadCloser, error) {
	url := fmt.Sprintf("%s%s", c.baseURL, path)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch file from SeaweedFS: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("seaweedfs returned status %d for path %s", resp.StatusCode, path)
	}

	return resp.Body, nil
}

// PutFileStream uploads a file to SeaweedFS from a stream
func (c *SeaweedFSClient) PutFileStream(path string, reader io.Reader) error {
	url := fmt.Sprintf("%s%s", c.baseURL, path)

	req, err := http.NewRequest("PUT", url, reader)
	if err != nil {
		return fmt.Errorf("failed to create PUT request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to upload file to SeaweedFS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("seaweedfs returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// FileExists checks if a file exists in SeaweedFS
func (c *SeaweedFSClient) FileExists(path string) (bool, error) {
	url := fmt.Sprintf("%s%s", c.baseURL, path)

	resp, err := http.Head(url)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}
