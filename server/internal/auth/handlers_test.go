package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRefreshHandler(t *testing.T) {
	// 1. Setup Redis
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		opt = &redis.Options{
			Addr: "localhost:6379",
		}
	}

	rdb := redis.NewClient(opt)
	ctx := context.Background()

	if err := rdb.Ping(ctx).Err(); err != nil {
		t.Skip("Redis not available, skipping test")
	}
	defer rdb.Close()

	// 2. Setup JWT
	priv, pub, err := generateTestKeys()
	require.NoError(t, err)

	err = InitJWT(priv, pub)
	require.NoError(t, err)

	handler := NewAuthHandler(rdb)

	userID := "test-user-id"

	t.Run("Successful Refresh", func(t *testing.T) {
		// Create a refresh token first
		token, err := CreateRefreshToken(ctx, rdb, userID)
		require.NoError(t, err)

		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{
			Name:  "refresh_token",
			Value: token,
		})

		w := httptest.NewRecorder()
		handler.Refresh(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]string
		err = json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		assert.NotEmpty(t, resp["access_token"])

		// Check for the new refresh token cookie
		cookies := w.Result().Cookies()
		var found bool
		for _, c := range cookies {
			if c.Name == "refresh_token" {
				found = true
				assert.NotEmpty(t, c.Value)
				assert.NotEqual(t, token, c.Value)
				assert.True(t, c.HttpOnly)
			}
		}
		assert.True(t, found)
	})

	t.Run("Missing Cookie", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		w := httptest.NewRecorder()
		handler.Refresh(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "missing refresh token")
	})

	t.Run("Invalid Token", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{
			Name:  "refresh_token",
			Value: "invalid-token",
		})

		w := httptest.NewRecorder()
		handler.Refresh(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "invalid or expired refresh token")
	})
}

func TestAuthHandler_Logout(t *testing.T) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
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

	h := NewAuthHandler(rdb)

	t.Run("Logout clears cookie and deletes token from Redis", func(t *testing.T) {
		userID := "test-user-id"
		token, err := CreateRefreshToken(ctx, rdb, userID)
		require.NoError(t, err)

		// Create request with refresh_token cookie
		req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
		req.AddCookie(&http.Cookie{
			Name:  "refresh_token",
			Value: token,
		})

		w := httptest.NewRecorder()
		h.Logout(w, req)

		// Check response code
		assert.Equal(t, http.StatusNoContent, w.Code)

		// Check if cookie is cleared
		cookies := w.Result().Cookies()
		var found bool
		for _, c := range cookies {
			if c.Name == "refresh_token" {
				found = true
				assert.Equal(t, "", c.Value)
				assert.True(t, c.Expires.Before(time.Now()))
			}
		}
		assert.True(t, found, "refresh_token cookie should be present in response to be cleared")

		// Check if token is deleted from Redis
		hash := hashToken(token)
		exists, err := rdb.Exists(ctx, SessionPrefix+hash).Result()
		require.NoError(t, err)
		assert.Equal(t, int64(0), exists)
	})

	t.Run("Logout without cookie should still return 204", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
		w := httptest.NewRecorder()
		h.Logout(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)
	})
}
