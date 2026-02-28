package auth

import (
	"context"
	"os"
	"testing"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRefreshToken(t *testing.T) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		// fallback to direct address if it's not a URL
		opt = &redis.Options{
			Addr: "localhost:6379",
		}
	}

	rdb := redis.NewClient(opt)
	ctx := context.Background()

	// Check if redis is available
	if err := rdb.Ping(ctx).Err(); err != nil {
		t.Skip("Redis not available, skipping test")
	}
	defer rdb.Close()

	userID := "test-user-id"

	t.Run("CreateRefreshToken", func(t *testing.T) {
		token, err := CreateRefreshToken(ctx, rdb, userID)
		require.NoError(t, err)
		assert.NotEmpty(t, token)

		// Check if stored in redis
		hash := hashToken(token)
		exists, err := rdb.Exists(ctx, SessionPrefix+hash).Result()
		require.NoError(t, err)
		assert.Equal(t, int64(1), exists)
	})

	t.Run("RotateRefreshToken", func(t *testing.T) {
		token, err := CreateRefreshToken(ctx, rdb, userID)
		require.NoError(t, err)

		newToken, returnedUserID, err := RotateRefreshToken(ctx, rdb, token)
		require.NoError(t, err)
		assert.NotEmpty(t, newToken)
		assert.NotEqual(t, token, newToken)
		assert.Equal(t, userID, returnedUserID)

		// Old token should be gone
		oldHash := hashToken(token)
		exists, err := rdb.Exists(ctx, SessionPrefix+oldHash).Result()
		require.NoError(t, err)
		assert.Equal(t, int64(0), exists)

		// New token should exist
		newHash := hashToken(newToken)
		exists, err = rdb.Exists(ctx, SessionPrefix+newHash).Result()
		require.NoError(t, err)
		assert.Equal(t, int64(1), exists)
	})

	t.Run("RotateInvalidToken", func(t *testing.T) {
		_, _, err := RotateRefreshToken(ctx, rdb, "invalid-token")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid or expired refresh token")
	})

	t.Run("DeleteRefreshToken", func(t *testing.T) {
		token, err := CreateRefreshToken(ctx, rdb, userID)
		require.NoError(t, err)

		err = DeleteRefreshToken(ctx, rdb, token)
		require.NoError(t, err)

		hash := hashToken(token)
		exists, err := rdb.Exists(ctx, SessionPrefix+hash).Result()
		require.NoError(t, err)
		assert.Equal(t, int64(0), exists)
	})
}
