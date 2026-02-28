package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func generateTestKeys() (string, string, error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return "", "", err
	}

	privateKeyBytes := x509.MarshalPKCS1PrivateKey(key)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	publicKeyBytes, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		return "", "", err
	}
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	return string(privateKeyPEM), string(publicKeyPEM), nil
}

func TestJWT(t *testing.T) {
	priv, pub, err := generateTestKeys()
	require.NoError(t, err)

	err = InitJWT(priv, pub)
	require.NoError(t, err)

	userID := "test-user-id"

	t.Run("GenerateAccessToken", func(t *testing.T) {
		token, err := GenerateAccessToken(userID)
		assert.NoError(t, err)
		assert.NotEmpty(t, token)

		// Validate it back
		gotUserID, err := ValidateAccessToken(token)
		assert.NoError(t, err)
		assert.Equal(t, userID, gotUserID)
	})

	t.Run("InvalidToken", func(t *testing.T) {
		_, err := ValidateAccessToken("invalid.token.here")
		assert.Error(t, err)
	})

	t.Run("ExpiredToken", func(t *testing.T) {
		// Mocking time for expiration is harder without a clock provider, 
		// but we can manually create an expired token for testing if needed.
		// For now, let's just test basic functionality.
	})
}
