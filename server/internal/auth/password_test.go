package auth

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPassword(t *testing.T) {
	password := "secret123"

	hash, err := HashPassword(password)
	require.NoError(t, err)
	assert.NotEmpty(t, hash)
	assert.NotEqual(t, password, hash)

	t.Run("CheckPassword Correct", func(t *testing.T) {
		assert.True(t, CheckPassword(password, hash))
	})

	t.Run("CheckPassword Incorrect", func(t *testing.T) {
		assert.False(t, CheckPassword("wrongpassword", hash))
	})

	t.Run("HashDifferent", func(t *testing.T) {
		hash2, err := HashPassword(password)
		require.NoError(t, err)
		assert.NotEqual(t, hash, hash2) // Salt should make it different
	})
}
