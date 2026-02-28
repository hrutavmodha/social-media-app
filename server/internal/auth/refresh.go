package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	RefreshTokenTTL = 30 * 24 * time.Hour
	SessionPrefix   = "session:"
)

type Session struct {
	UserID string    `json:"user_id"`
	Expiry time.Time `json:"expiry"`
}

// hashToken returns the sha256 hash of the token as a hex string.
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// generateRandomToken generates a cryptographically random 32-byte hex string.
func generateRandomToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// CreateRefreshToken generates a new refresh token, hashes it, and stores it in Redis.
// Returns the unhashed token.
func CreateRefreshToken(ctx context.Context, rdb *redis.Client, userID string) (string, error) {
	token, err := generateRandomToken()
	if err != nil {
		return "", err
	}

	hash := hashToken(token)
	expiry := time.Now().Add(RefreshTokenTTL)
	session := Session{
		UserID: userID,
		Expiry: expiry,
	}

	data, err := json.Marshal(session)
	if err != nil {
		return "", fmt.Errorf("failed to marshal session: %w", err)
	}

	err = rdb.Set(ctx, SessionPrefix+hash, data, RefreshTokenTTL).Err()
	if err != nil {
		return "", fmt.Errorf("failed to store session in redis: %w", err)
	}

	return token, nil
}

// RotateRefreshToken validates the old token, deletes it from Redis, and issues a new one.
// Returns the new token and the userID it belongs to.
func RotateRefreshToken(ctx context.Context, rdb *redis.Client, oldToken string) (string, string, error) {
	oldHash := hashToken(oldToken)
	key := SessionPrefix + oldHash

	// 1. Get and validate old token
	val, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", "", fmt.Errorf("invalid or expired refresh token")
	} else if err != nil {
		return "", "", fmt.Errorf("failed to get session from redis: %w", err)
	}

	var session Session
	if err := json.Unmarshal([]byte(val), &session); err != nil {
		return "", "", fmt.Errorf("failed to unmarshal session: %w", err)
	}

	// 2. Delete old token
	err = rdb.Del(ctx, key).Err()
	if err != nil {
		return "", "", fmt.Errorf("failed to delete old session: %w", err)
	}

	// 3. Create new token
	newToken, err := CreateRefreshToken(ctx, rdb, session.UserID)
	if err != nil {
		return "", "", fmt.Errorf("failed to create new refresh token: %w", err)
	}

	return newToken, session.UserID, nil
}

// DeleteRefreshToken removes the refresh token from Redis.
func DeleteRefreshToken(ctx context.Context, rdb *redis.Client, token string) error {
	hash := hashToken(token)
	return rdb.Del(ctx, SessionPrefix+hash).Err()
}
