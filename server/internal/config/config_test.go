package config

import (
	"strings"
	"testing"
)

func TestLoadMissingRequired(t *testing.T) {
	// Clear all required envs for this test
	keys := []string{"DB_URL", "REDIS_URL", "MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "JWT_SECRET", "PORT"}
	for _, k := range keys {
		t.Setenv(k, "")
	}

	_, err := Load()
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if !strings.Contains(err.Error(), "is required") {
		t.Errorf("Expected error to mention 'is required', got %v", err)
	}
}

func TestLoadSuccess(t *testing.T) {
	t.Setenv("DB_URL", "postgres://localhost:5432/test")
	t.Setenv("REDIS_URL", "redis://localhost:6379")
	t.Setenv("MINIO_ENDPOINT", "localhost:9000")
	t.Setenv("MINIO_ACCESS_KEY", "admin")
	t.Setenv("MINIO_SECRET_KEY", "password")
	t.Setenv("JWT_SECRET", "test-secret")
	t.Setenv("PORT", "9000")
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if cfg.DBURL != "postgres://localhost:5432/test" {
		t.Errorf("Expected DBURL 'postgres://localhost:5432/test', got %s", cfg.DBURL)
	}
	if cfg.Port != "9000" {
		t.Errorf("Expected Port '9000', got %s", cfg.Port)
	}
	if cfg.CORSAllowedOrigins != "http://localhost:3000" {
		t.Errorf("Expected CORSAllowedOrigins 'http://localhost:3000', got %s", cfg.CORSAllowedOrigins)
	}
}
