package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBURL               string
	RedisURL            string
	MinioEndpoint       string
	MinioAccessKey      string
	MinioSecretKey      string
	JWTSecret           string
	Port                string
	CORSAllowedOrigins string
}

func Load() (*Config, error) {
	config := &Config{
		DBURL:               getEnv("DB_URL", ""),
		RedisURL:            getEnv("REDIS_URL", ""),
		MinioEndpoint:       getEnv("MINIO_ENDPOINT", ""),
		MinioAccessKey:      getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey:      getEnv("MINIO_SECRET_KEY", ""),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		Port:                getEnv("PORT", "8080"),
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", ""),
	}

	if err := config.Validate(); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *Config) Validate() error {
	if c.DBURL == "" {
		return fmt.Errorf("DB_URL is required")
	}
	if c.RedisURL == "" {
		return fmt.Errorf("REDIS_URL is required")
	}
	if c.MinioEndpoint == "" {
		return fmt.Errorf("MINIO_ENDPOINT is required")
	}
	if c.MinioAccessKey == "" {
		return fmt.Errorf("MINIO_ACCESS_KEY is required")
	}
	if c.MinioSecretKey == "" {
		return fmt.Errorf("MINIO_SECRET_KEY is required")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if c.Port == "" {
		return fmt.Errorf("PORT is required")
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
